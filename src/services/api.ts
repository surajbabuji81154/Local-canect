import type { User, SafeUser, Conversation, Message, Plan, PaymentRecord, CityItem, AdminStats, Report } from '../types/index.ts';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('localconnect_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getAdminHeader(): Record<string, string> {
  const token = localStorage.getItem('localconnect_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAdminHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Admin request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) =>
    request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST'
    }),

  deleteAccount: () =>
    request<{ message: string }>('/auth/delete-account', {
      method: 'DELETE'
    }),

  // Profiles
  getProfiles: (params: { city?: string; minAge?: number; maxAge?: number; interest?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.city && params.city !== 'All') query.append('city', params.city);
    if (params.minAge) query.append('minAge', params.minAge.toString());
    if (params.maxAge) query.append('maxAge', params.maxAge.toString());
    if (params.interest && params.interest !== 'All') query.append('interest', params.interest);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    return request<{ profiles: SafeUser[]; count: number }>(`/profiles${queryString ? `?${queryString}` : ''}`);
  },

  getProfile: (id: string) => request<{ profile: SafeUser }>(`/profiles/${id}`),

  updateMyProfile: (data: Partial<User>) =>
    request<{ message: string; user: User }>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Messaging
  getConversations: () => request<{ conversations: Conversation[] }>('/conversations'),

  getMessages: (conversationId: string) =>
    request<{ conversation: Conversation; otherUser: SafeUser; messages: Message[] }>(`/conversations/${conversationId}/messages`),

  sendMessage: (payload: { recipientId?: string; conversationId?: string; text: string }) =>
    request<{ message: Message; conversationId: string }>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  unmatchConversation: (conversationId: string) =>
    request<{ message: string }>(`/conversations/${conversationId}/unmatch`, {
      method: 'DELETE'
    }),

  // Safety
  reportUser: (payload: { reportedUserId: string; reason: string; details?: string }) =>
    request<{ message: string; reportId: string }>('/safety/report', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  blockUser: (targetUserId: string) =>
    request<{ message: string }>('/safety/block', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    }),

  unblockUser: (targetUserId: string) =>
    request<{ message: string }>(`/safety/block/${targetUserId}`, {
      method: 'DELETE'
    }),

  // Payments & Subscription
  getPlans: () =>
    request<{ plans: Plan[]; razorpayKeyId: string; isLiveGateway: boolean }>('/payments/plans'),

  createOrder: (planId: string) =>
    request<{
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      plan: Plan;
      isLiveGateway: boolean;
    }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId })
    }),

  verifyPayment: (payload: { orderId: string; paymentId: string; signature: string }) =>
    request<{
      message: string;
      isPremium: boolean;
      premiumUntil?: string;
      telegramLink?: string;
    }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMyPaymentStatus: () =>
    request<{ isPremium: boolean; premiumUntil?: string | null; payments: PaymentRecord[] }>('/payments/my-status'),

  getTelegramLink: () =>
    request<{ telegramInviteLink: string }>('/payments/telegram-link'),

  // Public Cities
  getCities: () =>
    request<{ cities: CityItem[] }>('/admin/cities'),

  // Admin APIs
  adminLogin: (credentials: { email: string; password: string }) =>
    request<{ message: string; token: string; adminEmail: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  getAdminStats: () => adminRequest<{ stats: AdminStats }>('/admin/stats'),

  getAdminUsers: (params: { status?: string; search?: string; premium?: boolean } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.search) q.append('search', params.search);
    if (params.premium) q.append('premium', 'true');
    return adminRequest<{ users: User[] }>(`/admin/users?${q.toString()}`);
  },

  adminUserAction: (userId: string, action: string) =>
    adminRequest<{ message: string }>(`/admin/users/${userId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    }),

  getAdminReports: () => adminRequest<{ reports: Report[] }>('/admin/reports'),

  adminReportAction: (reportId: string, action: 'resolve' | 'dismiss') =>
    adminRequest<{ message: string }>(`/admin/reports/${reportId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    }),

  getAdminPlans: () => adminRequest<{ plans: Plan[] }>('/admin/plans'),

  updateAdminPlan: (planId: string, updates: Partial<Plan>) =>
    adminRequest<{ message: string; plan: Plan }>(`/admin/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  getAdminPayments: () => adminRequest<{ payments: PaymentRecord[] }>('/admin/payments'),

  getAdminSettings: () =>
    adminRequest<{ telegramInviteLink: string; razorpayKeyId: string; adminEmail: string }>('/admin/settings'),

  updateAdminSettings: (settings: { telegramInviteLink?: string; razorpayKeyId?: string; razorpayKeySecret?: string }) =>
    adminRequest<{ message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  addAdminCity: (data: { name: string; state?: string }) =>
    adminRequest<{ message: string; city: CityItem }>('/admin/cities', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateAdminCity: (cityId: string, data: Partial<CityItem>) =>
    adminRequest<{ message: string; city: CityItem }>(`/admin/cities/${cityId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};
