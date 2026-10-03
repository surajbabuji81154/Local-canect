export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
  bio: string;
  interests: string[];
  gender?: string;
  lookingFor?: string;
  isAgeConfirmed: boolean;
  isVerified: boolean;
  status: 'active' | 'suspended' | 'pending_approval' | 'blocked';
  isPremium: boolean;
  premiumUntil?: string | null;
  createdAt: string;
  lastActive: string;
  isDemo?: boolean;
}

export type SafeUser = Omit<User, 'email'> & {
  email?: string; // only returned for self or admin
};

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: {
    text: string;
    createdAt: string;
    senderId: string;
  };
  updatedAt: string;
  createdAt: string;
  otherUser?: SafeUser;
  unreadCount?: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  reportedUserId: string;
  reportedUserName?: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface Block {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  durationLabel: string;
  days: number;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Successful' | 'Failed' | 'Refunded';
  orderId: string;
  paymentId?: string;
  signature?: string;
  createdAt: string;
  verifiedAt?: string;
  method?: string;
}

export interface CityItem {
  id: string;
  name: string;
  state?: string;
  active: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalMessages: number;
  totalRevenue: number;
  pendingReports: number;
  demoProfilesCount: number;
}
