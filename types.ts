
export type UserRole = 'OWNER' | 'TENANT';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, this would be hashed. Storing plain for mock.
  role: UserRole;
  avatar: string;
  joinedDate: string;
}

export type PropertyCategory = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'COMMERCIAL' | 'LAND';

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  amenities: string[];
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  rating: number;
  category: PropertyCategory;
  isFeatured?: boolean;
  postedDate: string; // ISO String
  location?: { lat: number; lng: number }; // For Maps
}

export interface Inquiry {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName?: string; // Added to help Owners identify chats
  ownerId: string;
  status: 'PENDING' | 'REPLIED' | 'CLOSED' | 'ACCEPTED' | 'DECLINED';
  messages: Message[];
  lastUpdated: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
  isRead?: boolean; // Track if the user has seen this notification
  guests?: {
    adults: number;
    children: number;
    pets: number;
  };
}

export interface Stats {
  totalRevenue: number;
  occupancyRate: number;
  activeInquiries: number;
  totalProperties: number;
  monthlyRevenueData: { name: string; value: number }[];
}

export interface MapSearchResult {
  text: string;
  mapLinks: { title: string; uri: string }[];
}

// Analytics Types
export interface InteractionLog {
  id: string;
  userId: string;
  action: 'VIEW_PROPERTY' | 'CLICK_MAP' | 'AI_QUERY' | 'BOOKING_REQUEST';
  details: string;
  timestamp: string;
}