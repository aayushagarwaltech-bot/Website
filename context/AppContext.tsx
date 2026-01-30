import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, User, UserRole, Inquiry, Booking, Stats } from '../types';
import { db } from '../services/backend';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  properties: Property[];
  inquiries: Inquiry[];
  bookings: Booking[];
  stats: Stats;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (userData: {name: string, email: string, password: string, role: UserRole}) => Promise<void>;
  logout: () => void;
  addProperty: (property: Property) => void;
  deleteProperty: (id: string) => Promise<void>;
  addInquiry: (inquiry: Inquiry) => void;
  sendMessage: (inquiryId: string, text: string) => void;
  bookProperty: (propertyId: string, startDate: string, endDate: string, guests: {adults: number, children: number, pets: number}) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  logInteraction: (action: string, details: string) => void;
  markNotificationsAsRead: () => Promise<void>;
  
  // Compare Feature
  compareList: Property[];
  addToCompare: (property: Property) => void;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>('TENANT');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, occupancyRate: 0, activeInquiries: 0, totalProperties: 0, monthlyRevenueData: []
  });

  const [compareList, setCompareList] = useState<Property[]>([]);

  // Function to fetch all data
  const fetchData = async () => {
    try {
      const [props, inqs, bks, st] = await Promise.all([
        db.getProperties(),
        db.getInquiries(),
        db.getBookings(),
        db.getStats()
      ]);
      setProperties(props);
      setInquiries(inqs);
      setBookings(bks);
      setStats(st);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(() => setIsLoading(false));

    // GLOBAL CHECK: Poll for updates every 30 seconds to simulate a live backend
    const interval = setInterval(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (email: string, pass: string) => {
    const authenticatedUser = await db.authenticateUser(email, pass);
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
    setIsAuthenticated(true);
  };

  const signup = async (userData: {name: string, email: string, password: string, role: UserRole}) => {
    const newUser = await db.createUser(userData);
    setUser(newUser);
    setRole(newUser.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const addProperty = async (property: Property) => {
    const newProp = await db.addProperty(property);
    setProperties(prev => [newProp, ...prev]);
    if (user) db.logInteraction(user.id, 'VIEW_PROPERTY', `Added property ${property.title}`);
  };

  const deleteProperty = async (id: string) => {
    await db.deleteProperty(id);
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const addInquiry = async (inquiry: Inquiry) => {
    const newInq = await db.addInquiry(inquiry);
    setInquiries(prev => [newInq, ...prev]);
    if (user) db.logInteraction(user.id, 'AI_QUERY', `Inquiry sent for property ${inquiry.propertyId}`);
  };

  const sendMessage = async (inquiryId: string, text: string) => {
    if (!user) return;
    const targetInquiry = inquiries.find(i => i.id === inquiryId);
    if (!targetInquiry) return;

    const updatedInquiry = {
      ...targetInquiry,
      lastUpdated: new Date().toISOString(),
      status: role === 'OWNER' ? 'REPLIED' as const : 'PENDING' as const,
      messages: [...targetInquiry.messages, {
        id: Date.now().toString(),
        senderId: user.id,
        text,
        timestamp: new Date().toISOString()
      }]
    };

    await db.updateInquiry(updatedInquiry);
    setInquiries(prev => prev.map(inq => inq.id === inquiryId ? updatedInquiry : inq));
  };

  const bookProperty = async (propertyId: string, startDate: string, endDate: string, guests: {adults: number, children: number, pets: number}) => {
    if (!user) return;
    const booking: Booking = {
      id: Date.now().toString(),
      propertyId,
      tenantId: user.id,
      startDate,
      endDate,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      isRead: false,
      guests
    };
    await db.createBooking(booking);
    setBookings(prev => [...prev, booking]);
    alert(`Booking Request Sent! ID: ${booking.id}`);
    db.logInteraction(user.id, 'BOOKING_REQUEST', `Booking req for ${propertyId}`);
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    await db.updateBookingStatus(bookingId, status);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status, isRead: false } : b));
  }

  const markNotificationsAsRead = async () => {
      if (!user) return;
      await db.markAllNotificationsRead(user.id, role);
      setBookings(prev => prev.map(b => {
          // Check if this booking belongs to the user context
          let isTarget = false;
          if (role === 'OWNER') {
              const prop = properties.find(p => p.id === b.propertyId);
              if (prop?.ownerId === user.id) isTarget = true;
          } else {
              if (b.tenantId === user.id) isTarget = true;
          }
          return isTarget ? { ...b, isRead: true } : b;
      }));
  };

  const logInteraction = (action: string, details: string) => {
    if (user) db.logInteraction(user.id, action as any, details);
  };

  // Compare Logic
  const addToCompare = (property: Property) => {
      if (compareList.length >= 3) {
          alert("You can only compare up to 3 properties.");
          return;
      }
      if (!compareList.find(p => p.id === property.id)) {
          setCompareList([...compareList, property]);
      }
  };

  const removeFromCompare = (propertyId: string) => {
      setCompareList(prev => prev.filter(p => p.id !== propertyId));
  };

  const clearCompare = () => setCompareList([]);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, role, properties, inquiries, bookings, stats, isLoading,
      login, signup, logout, addProperty, deleteProperty, addInquiry, sendMessage, bookProperty, updateBookingStatus, logInteraction, markNotificationsAsRead,
      compareList, addToCompare, removeFromCompare, clearCompare
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};