import { Property, Inquiry, User, Stats, Booking, InteractionLog } from '../types';

// City Coordinates for Map Placement
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 }
};

// Helper to randomize location slightly so markers don't overlap perfectly
const getJitteredLoc = (city: string) => {
  const base = CITY_COORDS[city] || { lat: 20.5937, lng: 78.9629 };
  return {
    lat: base.lat + (Math.random() - 0.5) * 0.05,
    lng: base.lng + (Math.random() - 0.5) * 0.05
  };
};

// Curated high-quality "AI-style" architectural images
const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1600596542815-2a4d9f0152ba?q=80&w=800', // Modern Living Room
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800', // Luxury Villa Exterior
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800', // Modern Kitchen
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800', // Minimalist Bedroom
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800', // Modern Apartment Building
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800', // Balcony View
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=800', // Glass Facade
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800', // Cozy Apartment
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800', // Loft Style
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800', // Real Estate Interior
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=800', // Blue tone living
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800', // Warm interior
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800', // Clean bathroom
  'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?q=80&w=800', // Hallway
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=800'  // Building Low angle
];

const getRandomImages = (count: number) => {
  const shuffled = [...IMAGE_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Data derived from the CSV provided
const SEED_PROPERTIES: Property[] = [
  // --- MUMBAI ---
  {
    id: 'm1', ownerId: 'owner1',
    title: 'Ultra-Luxe 4BHK at Trump Tower',
    description: 'Experience the pinnacle of luxury living in Worli. This semi-furnished 4BHK in Trump Tower offers breathtaking sea views, world-class amenities, and high-end security.',
    address: 'Trump Tower, Worli, Mumbai',
    price: 300000, bedrooms: 4, bathrooms: 5, sqft: 1600,
    images: [IMAGE_POOL[1], IMAGE_POOL[0], IMAGE_POOL[5]],
    amenities: ['Sea View', 'Concierge', 'Gym', 'Pool', 'Semi-Furnished'],
    status: 'AVAILABLE', rating: 5.0, category: 'VILLA', isFeatured: true,
    postedDate: '2022-07-07T00:00:00Z', location: getJitteredLoc('Mumbai')
  },
  {
    id: 'm2', ownerId: 'owner2',
    title: 'Chic 2BHK in Santacruz West',
    description: 'A beautifully furnished 2BHK apartment in the heart of Santacruz West. High floor with great ventilation. Perfect for families or working professionals.',
    address: 'Santacruz West, Mumbai',
    price: 70000, bedrooms: 2, bathrooms: 2, sqft: 750,
    images: [IMAGE_POOL[7], IMAGE_POOL[2]],
    amenities: ['Furnished', 'Lift', 'Security', 'Water Supply'],
    status: 'AVAILABLE', rating: 4.8, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-06-14T00:00:00Z', location: getJitteredLoc('Mumbai')
  },
  {
    id: 'm3', ownerId: 'owner1',
    title: 'Spacious 3BHK in Chembur',
    description: 'Unfurnished 3BHK in Sabari Palm View. Large carpet area, ideal for families looking to design their own space. Close to monorail.',
    address: 'Sabari Palm View, Chembur, Mumbai',
    price: 75000, bedrooms: 3, bathrooms: 3, sqft: 1100,
    images: [IMAGE_POOL[4], IMAGE_POOL[13]],
    amenities: ['Unfurnished', 'Parking', 'Gated Community'],
    status: 'AVAILABLE', rating: 4.5, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-05-27T00:00:00Z', location: getJitteredLoc('Mumbai')
  },
  {
    id: 'm4', ownerId: 'owner1',
    title: 'Cozy 1BHK Studio in Andheri West',
    description: 'Semi-furnished 1BHK in Shaheen Apartment. Excellent connectivity to Versova Metro and Juhu Beach.',
    address: 'Shaheen Apartment, Andheri West, Mumbai',
    price: 25000, bedrooms: 1, bathrooms: 1, sqft: 320,
    images: [IMAGE_POOL[8], IMAGE_POOL[3]],
    amenities: ['Semi-Furnished', 'Metro Access', 'Market Nearby'],
    status: 'AVAILABLE', rating: 4.2, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-05-16T00:00:00Z', location: getJitteredLoc('Mumbai')
  },

  // --- BANGALORE ---
  {
    id: 'b1', ownerId: 'owner3',
    title: 'Grand 3BHK Villa in Talagatta Pura',
    description: 'Expansive 3BHK home with 3354 sqft of living space. Furnished interiors with a touch of elegance. Located in a serene neighborhood.',
    address: 'Talagatta Pura, Bangalore',
    price: 70000, bedrooms: 3, bathrooms: 3, sqft: 3354,
    images: [IMAGE_POOL[1], IMAGE_POOL[6]],
    amenities: ['Furnished', 'Garden', 'Power Backup', '3 Balconies'],
    status: 'AVAILABLE', rating: 4.9, category: 'HOUSE', isFeatured: true,
    postedDate: '2022-06-30T00:00:00Z', location: getJitteredLoc('Bangalore')
  },
  {
    id: 'b2', ownerId: 'owner3',
    title: 'Modern 4BHK in Malleshwaram',
    description: 'Semi-furnished 4BHK apartment in the cultural hub of Bangalore. Close to IISc and Sankey Tank. Premium fittings.',
    address: 'Malleshwaram, Bangalore',
    price: 61500, bedrooms: 4, bathrooms: 3, sqft: 2608,
    images: [IMAGE_POOL[5], IMAGE_POOL[0]],
    amenities: ['Semi-Furnished', 'Lift', 'Security', 'Central Location'],
    status: 'AVAILABLE', rating: 4.7, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-07-09T00:00:00Z', location: getJitteredLoc('Bangalore')
  },
  {
    id: 'b3', ownerId: 'owner4',
    title: 'Affordable 2BHK in Dooravani Nagar',
    description: 'Budget-friendly semi-furnished apartment. Good ventilation and water supply. Ideal for small families.',
    address: 'Nagappa Reddy layout-Dooravani Nagar, Bangalore',
    price: 10500, bedrooms: 2, bathrooms: 2, sqft: 800,
    images: [IMAGE_POOL[7]],
    amenities: ['Semi-Furnished', 'Water Supply', 'Two Wheeler Parking'],
    status: 'AVAILABLE', rating: 4.0, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-06-23T00:00:00Z', location: getJitteredLoc('Bangalore')
  },

  // --- DELHI ---
  {
    id: 'd1', ownerId: 'owner2',
    title: 'Stylish 3BHK in South Extension',
    description: 'Semi-furnished 3BHK floor in South Ext 1. High-end neighborhood with access to premium markets and metro.',
    address: 'South Extension 1, Delhi',
    price: 80000, bedrooms: 3, bathrooms: 3, sqft: 1800,
    images: [IMAGE_POOL[0], IMAGE_POOL[2], IMAGE_POOL[13]],
    amenities: ['Semi-Furnished', 'Metro', 'Park Facing', 'Gated'],
    status: 'AVAILABLE', rating: 4.8, category: 'HOUSE', isFeatured: true,
    postedDate: '2022-06-26T00:00:00Z', location: getJitteredLoc('Delhi')
  },
  {
    id: 'd2', ownerId: 'owner2',
    title: '1BHK Studio in Hauz Khas',
    description: 'Artist-friendly furnished studio in Hauz Khas. Walkable distance to Deer Park and Hauz Khas Village nightlife.',
    address: 'Hauz Khas, Delhi',
    price: 20000, bedrooms: 1, bathrooms: 1, sqft: 200,
    images: [IMAGE_POOL[8]],
    amenities: ['Furnished', 'Roof Access', 'Trendy Area'],
    status: 'AVAILABLE', rating: 4.3, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-06-30T00:00:00Z', location: getJitteredLoc('Delhi')
  },
  {
    id: 'd3', ownerId: 'owner2',
    title: '2BHK Builder Floor in Keshav Puram',
    description: 'Independent floor with semi-furnished interiors. Safe neighborhood near Tri Nagar. Suitable for families.',
    address: 'Keshav Puram, Tri Nagar, Delhi',
    price: 14000, bedrooms: 2, bathrooms: 2, sqft: 800,
    images: [IMAGE_POOL[9], IMAGE_POOL[11]],
    amenities: ['Semi-Furnished', 'Independent Floor', 'Water Tank'],
    status: 'AVAILABLE', rating: 3.9, category: 'HOUSE', isFeatured: false,
    postedDate: '2022-06-24T00:00:00Z', location: getJitteredLoc('Delhi')
  },

  // --- HYDERABAD ---
  {
    id: 'h1', ownerId: 'owner5',
    title: 'Palatial 4BHK in Jubilee Hills',
    description: 'Prestigious address in Jubilee Hills. Expansive 4500 sqft residence with semi-furnished interiors. Home to the elite.',
    address: 'Jubilee Hills, Hyderabad',
    price: 250000, bedrooms: 4, bathrooms: 4, sqft: 4500,
    images: [IMAGE_POOL[1], IMAGE_POOL[5], IMAGE_POOL[12]],
    amenities: ['Semi-Furnished', 'Private Garden', 'Servant Quarters', '3 Car Parking'],
    status: 'AVAILABLE', rating: 5.0, category: 'VILLA', isFeatured: true,
    postedDate: '2022-06-30T00:00:00Z', location: getJitteredLoc('Hyderabad')
  },
  {
    id: 'h2', ownerId: 'owner5',
    title: '4BHK Apartment in Financial District',
    description: 'Modern apartment in Nanakram Guda. Close to Gachibowli IT corridor. Ideal for corporate leasing.',
    address: 'Financial District, Nanakram Guda, Hyderabad',
    price: 75000, bedrooms: 4, bathrooms: 4, sqft: 3800,
    images: [IMAGE_POOL[14], IMAGE_POOL[6]],
    amenities: ['Semi-Furnished', 'Clubhouse', 'Gym', 'Swimming Pool'],
    status: 'AVAILABLE', rating: 4.7, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-06-28T00:00:00Z', location: getJitteredLoc('Hyderabad')
  },

  // --- CHENNAI ---
  {
    id: 'c1', ownerId: 'owner6',
    title: 'Luxury 3BHK at Boat Club Road',
    description: 'Rare opportunity to rent in Boat Club Road. 3000 sqft of pure luxury. Furnished with antique furniture and modern fittings.',
    address: 'Madras Boat Club Road, Chennai',
    price: 200000, bedrooms: 3, bathrooms: 4, sqft: 3000,
    images: [IMAGE_POOL[0], IMAGE_POOL[10]],
    amenities: ['Furnished', 'Leafy Neighborhood', 'High Security', 'Power Backup'],
    status: 'AVAILABLE', rating: 5.0, category: 'HOUSE', isFeatured: true,
    postedDate: '2022-07-10T00:00:00Z', location: getJitteredLoc('Chennai')
  },
  {
    id: 'c2', ownerId: 'owner6',
    title: '3BHK Flat in R.A Puram',
    description: 'Semi-furnished apartment in Mandaiveli. Excellent schools and shopping nearby. Spacious and well-lit.',
    address: 'R.A Puram, Mandaiveli, Chennai',
    price: 90000, bedrooms: 3, bathrooms: 3, sqft: 2400,
    images: [IMAGE_POOL[4], IMAGE_POOL[11]],
    amenities: ['Semi-Furnished', 'Lift', 'Covered Parking'],
    status: 'AVAILABLE', rating: 4.6, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-05-20T00:00:00Z', location: getJitteredLoc('Chennai')
  },
  {
    id: 'c3', ownerId: 'owner6',
    title: '2BHK in Medavakkam',
    description: 'Affordable semi-furnished apartment in a gated community. Close to Sholinganallur ELCOT SEZ.',
    address: 'Medavakkam, Chennai',
    price: 15000, bedrooms: 2, bathrooms: 2, sqft: 1100,
    images: [IMAGE_POOL[13]],
    amenities: ['Semi-Furnished', 'Park', 'Security'],
    status: 'AVAILABLE', rating: 4.1, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-07-06T00:00:00Z', location: getJitteredLoc('Chennai')
  },

  // --- KOLKATA ---
  {
    id: 'k1', ownerId: 'owner4',
    title: '3BHK in New Town Action Area 1',
    description: 'Modern apartment in Rajarhat Newtown. Close to IT hubs and Eco Park. Semi-furnished with modular kitchen.',
    address: 'Action Area 1, Rajarhat Newtown, Kolkata',
    price: 25000, bedrooms: 3, bathrooms: 2, sqft: 1200,
    images: [IMAGE_POOL[14], IMAGE_POOL[2]],
    amenities: ['Semi-Furnished', 'Lift', 'Parking', 'Gym'],
    status: 'AVAILABLE', rating: 4.3, category: 'APARTMENT', isFeatured: true,
    postedDate: '2022-05-23T00:00:00Z', location: getJitteredLoc('Kolkata')
  },
  {
    id: 'k2', ownerId: 'owner4',
    title: '2BHK in Salt Lake Sector 2',
    description: 'Peaceful residential block in Salt Lake. Semi-furnished 2BHK with balcony overlooking the park.',
    address: 'Salt Lake City Sector 2, Kolkata',
    price: 17000, bedrooms: 2, bathrooms: 1, sqft: 1000,
    images: [IMAGE_POOL[7]],
    amenities: ['Semi-Furnished', 'Park Facing', '24h Water'],
    status: 'AVAILABLE', rating: 4.2, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-05-16T00:00:00Z', location: getJitteredLoc('Kolkata')
  },
  {
    id: 'k3', ownerId: 'owner4',
    title: 'Budget 2BHK in Bandel',
    description: 'Unfurnished ground floor apartment in Bandel. Very close to station. Ideal for commuters.',
    address: 'Bandel, Kolkata',
    price: 10000, bedrooms: 2, bathrooms: 2, sqft: 1100,
    images: [IMAGE_POOL[8]],
    amenities: ['Unfurnished', 'Ground Floor', 'Near Station'],
    status: 'AVAILABLE', rating: 3.8, category: 'APARTMENT', isFeatured: false,
    postedDate: '2022-05-18T00:00:00Z', location: getJitteredLoc('Kolkata')
  }
];

const SEED_STATS: Stats = {
  totalRevenue: 2450000,
  occupancyRate: 92,
  activeInquiries: 12,
  totalProperties: SEED_PROPERTIES.length,
  monthlyRevenueData: [
    { name: 'Jan', value: 180000 },
    { name: 'Feb', value: 210000 },
    { name: 'Mar', value: 250000 },
    { name: 'Apr', value: 240000 },
    { name: 'May', value: 280000 },
    { name: 'Jun', value: 350000 },
  ]
};

const DB_KEYS = {
  PROPERTIES: 'rf_properties',
  INQUIRIES: 'rf_inquiries',
  USERS: 'rf_users',
  STATS: 'rf_stats',
  BOOKINGS: 'rf_bookings',
  LOGS: 'rf_logs'
};

// SHA-256 for 'password'
const DEFAULT_PASS_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';

const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const db = {
  init: () => {
    if (!localStorage.getItem(DB_KEYS.PROPERTIES)) {
      localStorage.setItem(DB_KEYS.PROPERTIES, JSON.stringify(SEED_PROPERTIES));
    }
    if (!localStorage.getItem(DB_KEYS.STATS)) {
      localStorage.setItem(DB_KEYS.STATS, JSON.stringify(SEED_STATS));
    }
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      // Seed default users with HASHED passwords
      const defaultUsers: User[] = [
        { id: 'owner1', name: 'Rajesh Kumar', email: 'owner@rentflow.com', password: DEFAULT_PASS_HASH, role: 'OWNER', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar', joinedDate: new Date().toISOString() },
        { id: 'owner2', name: 'Amit Shah', email: 'amit@rentflow.com', password: DEFAULT_PASS_HASH, role: 'OWNER', avatar: 'https://ui-avatars.com/api/?name=Amit+Shah', joinedDate: new Date().toISOString() },
        { id: 'owner3', name: 'Sneha Reddy', email: 'sneha@rentflow.com', password: DEFAULT_PASS_HASH, role: 'OWNER', avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy', joinedDate: new Date().toISOString() },
        { id: 'owner4', name: 'Vikram Singh', email: 'vikram@rentflow.com', password: DEFAULT_PASS_HASH, role: 'OWNER', avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh', joinedDate: new Date().toISOString() },
        { id: 'owner5', name: 'Priya Menon', email: 'priya@rentflow.com', password: DEFAULT_PASS_HASH, role: 'OWNER', avatar: 'https://ui-avatars.com/api/?name=Priya+Menon', joinedDate: new Date().toISOString() },
        { id: 'owner6', name: 'Arun Das', email: 'arun@rentflow.com', password: DEFAULT_PASS_HASH, role: 'OWNER', avatar: 'https://ui-avatars.com/api/?name=Arun+Das', joinedDate: new Date().toISOString() },
        { id: 'tenant1', name: 'Anjali Sharma', email: 'tenant@rentflow.com', password: DEFAULT_PASS_HASH, role: 'TENANT', avatar: 'https://ui-avatars.com/api/?name=Anjali+Sharma', joinedDate: new Date().toISOString() }
      ];
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(DB_KEYS.INQUIRIES)) localStorage.setItem(DB_KEYS.INQUIRIES, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.BOOKINGS)) localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.LOGS)) localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([]));
  },

  get: <T>(key: string): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  set: <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- USER AUTHENTICATION ---
  
  createUser: async (userData: Omit<User, 'id' | 'joinedDate' | 'avatar'>): Promise<User> => {
      const users = db.get<User[]>(DB_KEYS.USERS);
      if (users.find(u => u.email === userData.email)) {
        throw new Error("User with this email already exists");
      }
      
      const hashedPassword = await hashPassword(userData.password || '');

      const newUser: User = {
        ...userData,
        password: hashedPassword,
        id: Date.now().toString(),
        joinedDate: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${userData.name.replace(' ', '+')}&background=00B5B7&color=fff`
      };
      
      db.set(DB_KEYS.USERS, [...users, newUser]);
      return newUser;
  },

  authenticateUser: async (email: string, pass: string): Promise<User> => {
      const users = db.get<User[]>(DB_KEYS.USERS);
      const hashedPass = await hashPassword(pass);
      const user = users.find(u => u.email === email && u.password === hashedPass);
      
      if (user) {
        return user;
      } else {
        throw new Error("Invalid email or password");
      }
  },

  // --- ANALYTICS & LOGGING ---
  
  logInteraction: (userId: string, action: InteractionLog['action'], details: string) => {
    const logs = db.get<InteractionLog[]>(DB_KEYS.LOGS);
    const newLog: InteractionLog = {
      id: Date.now().toString(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.set(DB_KEYS.LOGS, [newLog, ...logs]);
  },

  // --- PROPERTIES ---
  getProperties: (): Promise<Property[]> => {
    return new Promise(resolve => setTimeout(() => resolve(db.get<Property[]>(DB_KEYS.PROPERTIES)), 300));
  },

  addProperty: (property: Property): Promise<Property> => {
    return new Promise(resolve => {
      const props = db.get<Property[]>(DB_KEYS.PROPERTIES);
      db.set(DB_KEYS.PROPERTIES, [property, ...props]);
      
      // Update Stats
      const stats = db.get<Stats>(DB_KEYS.STATS);
      stats.totalProperties += 1;
      db.set(DB_KEYS.STATS, stats);
      
      resolve(property);
    });
  },

  deleteProperty: (propertyId: string): Promise<void> => {
    return new Promise(resolve => {
      const props = db.get<Property[]>(DB_KEYS.PROPERTIES);
      db.set(DB_KEYS.PROPERTIES, props.filter(p => p.id !== propertyId));
      
      const stats = db.get<Stats>(DB_KEYS.STATS);
      stats.totalProperties = Math.max(0, stats.totalProperties - 1);
      db.set(DB_KEYS.STATS, stats);
      
      resolve();
    });
  },

  // --- INQUIRIES ---
  getInquiries: (): Promise<Inquiry[]> => {
    return new Promise(resolve => setTimeout(() => resolve(db.get<Inquiry[]>(DB_KEYS.INQUIRIES)), 300));
  },

  addInquiry: (inquiry: Inquiry): Promise<Inquiry> => {
    return new Promise(resolve => {
      const inqs = db.get<Inquiry[]>(DB_KEYS.INQUIRIES);
      db.set(DB_KEYS.INQUIRIES, [inquiry, ...inqs]);
      
      const stats = db.get<Stats>(DB_KEYS.STATS);
      stats.activeInquiries += 1;
      db.set(DB_KEYS.STATS, stats);
      
      resolve(inquiry);
    });
  },

  updateInquiry: (updatedInquiry: Inquiry): Promise<Inquiry> => {
    return new Promise(resolve => {
      const inqs = db.get<Inquiry[]>(DB_KEYS.INQUIRIES);
      db.set(DB_KEYS.INQUIRIES, inqs.map(i => i.id === updatedInquiry.id ? updatedInquiry : i));
      resolve(updatedInquiry);
    });
  },

  // --- BOOKINGS ---
  createBooking: (booking: Booking): Promise<Booking> => {
    return new Promise(resolve => {
      const bookings = db.get<Booking[]>(DB_KEYS.BOOKINGS);
      // Ensure isRead is set to false initially
      const newBooking = { ...booking, isRead: false };
      db.set(DB_KEYS.BOOKINGS, [...bookings, newBooking]);
      resolve(newBooking);
    });
  },

  getBookings: (): Promise<Booking[]> => {
    return new Promise(resolve => setTimeout(() => resolve(db.get<Booking[]>(DB_KEYS.BOOKINGS)), 300));
  },

  updateBookingStatus: (bookingId: string, status: Booking['status']): Promise<void> => {
    return new Promise(resolve => {
      const bookings = db.get<Booking[]>(DB_KEYS.BOOKINGS);
      const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status, isRead: false } : b);
      db.set(DB_KEYS.BOOKINGS, updatedBookings);
      resolve();
    });
  },

  markAllNotificationsRead: (userId: string, role: string): Promise<void> => {
      return new Promise(resolve => {
          const bookings = db.get<Booking[]>(DB_KEYS.BOOKINGS);
          const properties = db.get<Property[]>(DB_KEYS.PROPERTIES);
          
          const updatedBookings = bookings.map(b => {
              let isTarget = false;
              if (role === 'OWNER') {
                  const prop = properties.find(p => p.id === b.propertyId);
                  if (prop?.ownerId === userId) isTarget = true;
              } else {
                  if (b.tenantId === userId) isTarget = true;
              }
              
              if (isTarget) {
                  return { ...b, isRead: true };
              }
              return b;
          });
          
          db.set(DB_KEYS.BOOKINGS, updatedBookings);
          resolve();
      });
  },

  getStats: (): Promise<Stats> => {
    return new Promise(resolve => setTimeout(() => resolve(db.get<Stats>(DB_KEYS.STATS)), 200));
  }
};

db.init();