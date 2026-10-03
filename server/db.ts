import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { User, Message, Conversation, Report, Block, Plan, PaymentRecord, CityItem } from '../src/types/index.ts';

export interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  conversations: Conversation[];
  messages: Message[];
  reports: Report[];
  blocks: Block[];
  plans: Plan[];
  payments: PaymentRecord[];
  cities: CityItem[];
  settings: {
    telegramInviteLink: string;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    adminEmail: string;
    adminPasswordHash: string;
    adminPasswordSalt: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'localconnect.db.json');

// Password utility
export function hashPassword(password: string, existingSalt?: string): { passwordHash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { passwordHash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Initial demo seed data (clearly labeled as DEMO DATA)
const initialDemoUsers: (User & { passwordHash: string; salt: string })[] = [
  {
    id: 'demo-usr-1',
    name: 'Aanya Sharma',
    email: 'aanya.demo@localconnect.app',
    age: 26,
    city: 'Delhi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'Architect, coffee enthusiast, and weekend cyclist. Looking for meaningful conversations and city exploration.',
    interests: ['Architecture', 'Filter Coffee', 'Cycling', 'Art Galleries', 'Indie Music'],
    gender: 'Female',
    lookingFor: 'Men',
    isAgeConfirmed: true,
    isVerified: true,
    status: 'active',
    isPremium: true,
    premiumUntil: '2027-12-31T23:59:59Z',
    createdAt: '2026-08-10T12:00:00Z',
    lastActive: '5 mins ago',
    isDemo: true,
    ...hashPassword('DemoPassword123!')
  },
  {
    id: 'demo-usr-2',
    name: 'Kabir Mehta',
    email: 'kabir.demo@localconnect.app',
    age: 29,
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'Product designer living between Bandra and Colaba. Huge foodie, vinyl collector, and sunset runner.',
    interests: ['Foodie', 'Vinyl', 'Running', 'Design', 'Cocktails'],
    gender: 'Male',
    lookingFor: 'Women',
    isAgeConfirmed: true,
    isVerified: true,
    status: 'active',
    isPremium: false,
    createdAt: '2026-08-14T09:30:00Z',
    lastActive: 'Online',
    isDemo: true,
    ...hashPassword('DemoPassword123!')
  },
  {
    id: 'demo-usr-3',
    name: 'Priya Verma',
    email: 'priya.demo@localconnect.app',
    age: 24,
    city: 'Lucknow',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'Literature lecturer & heritage walk lover. I appreciate deep conversations, old monuments, and Awadhi cuisine.',
    interests: ['Literature', 'Heritage', 'Poetry', 'Tea', 'Museums'],
    gender: 'Female',
    lookingFor: 'Men',
    isAgeConfirmed: true,
    isVerified: true,
    status: 'active',
    isPremium: true,
    premiumUntil: '2027-11-20T23:59:59Z',
    createdAt: '2026-08-20T15:20:00Z',
    lastActive: '12 mins ago',
    isDemo: true,
    ...hashPassword('DemoPassword123!')
  },
  {
    id: 'demo-usr-4',
    name: 'Rohan Deshmukh',
    email: 'rohan.demo@localconnect.app',
    age: 31,
    city: 'Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'Tech founder by day, amateur guitarist and boulderer by dusk. Always up for good craft beer and live gigs.',
    interests: ['Tech', 'Rock Music', 'Bouldering', 'Craft Beer', 'Travel'],
    gender: 'Male',
    lookingFor: 'Women',
    isAgeConfirmed: true,
    isVerified: true,
    status: 'active',
    isPremium: false,
    createdAt: '2026-08-22T18:00:00Z',
    lastActive: 'Online',
    isDemo: true,
    ...hashPassword('DemoPassword123!')
  },
  {
    id: 'demo-usr-5',
    name: 'Ishaan Trivedi',
    email: 'ishaan.demo@localconnect.app',
    age: 27,
    city: 'Kanpur',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    bio: 'Civil engineer and weekend photographer. Love street food crawls along the river and vintage photography.',
    interests: ['Photography', 'Street Food', 'Fitness', 'Automobiles'],
    gender: 'Male',
    lookingFor: 'Women',
    isAgeConfirmed: true,
    isVerified: true,
    status: 'active',
    isPremium: false,
    createdAt: '2026-08-25T11:15:00Z',
    lastActive: '1 hour ago',
    isDemo: true,
    ...hashPassword('DemoPassword123!')
  },
  {
    id: 'demo-usr-6',
    name: 'Meera Rathore',
    email: 'meera.demo@localconnect.app',
    age: 28,
    city: 'Jaipur',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    bio: 'Textile curator & interior designer. Exploring rooftop cafes, royal palace history, and pottery workshops.',
    interests: ['Textiles', 'Pottery', 'Rooftop Cafes', 'Travel', 'Baking'],
    gender: 'Female',
    lookingFor: 'Men',
    isAgeConfirmed: true,
    isVerified: true,
    status: 'active',
    isPremium: true,
    premiumUntil: '2027-10-15T23:59:59Z',
    createdAt: '2026-08-28T14:45:00Z',
    lastActive: 'Online',
    isDemo: true,
    ...hashPassword('DemoPassword123!')
  },
  {
    id: 'demo-usr-7',
    name: 'Arjun Reddy',
    email: 'arjun.demo@localconnect.app',
    age: 30,
    city: 'Hyderabad',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    bio: 'Fintech analyst, badminton player, and Biryani connoisseur. Looking for someone genuine to share laughter and weekends.',
    interests: ['Badminton', 'Biryani', 'Finance', 'Sci-Fi Books', 'Board Games'],
    gender: 'Male',
    lookingFor: 'Women',
    isAgeConfirmed: true,
    isVerified: true,
    status: 'active',
    isPremium: true,
    premiumUntil: '2027-11-01T23:59:59Z',
    createdAt: '2026-09-02T10:00:00Z',
    lastActive: 'Online',
    isDemo: true,
    ...hashPassword('DemoPassword123!')
  }
];

const initialCities: CityItem[] = [
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', active: true },
  { id: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', active: true },
  { id: 'delhi', name: 'Delhi', state: 'National Capital Region', active: true },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', active: true },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', active: true },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', active: true },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', active: true },
];

const initialPlans: Plan[] = [
  {
    id: 'plan_1_day',
    name: '1 Day Pass',
    durationLabel: '24 Hours',
    days: 1,
    price: 49,
    features: [
      'Unlimited messaging for 24 hours',
      'Instant access to verified adult profiles',
      'See who liked your profile',
      'Access to Telegram VIP Community'
    ],
    popular: false
  },
  {
    id: 'plan_7_days',
    name: '7 Days Weekly',
    durationLabel: '7 Days',
    days: 7,
    price: 149,
    features: [
      'Unlimited messaging for 7 days',
      'Priority profile discovery in your city',
      'Advanced filters (Interests, Verification)',
      'Verified Adult Gold Badge',
      'Direct Telegram Community link'
    ],
    popular: true
  },
  {
    id: 'plan_30_days',
    name: '30 Days Monthly',
    durationLabel: '30 Days',
    days: 30,
    price: 299,
    features: [
      'Unlimited messaging for full month',
      'Top spotlight ranking in your city',
      'Read receipts & live online status',
      'VIP Telegram Community permanent pass',
      'Priority 24/7 dedicated support'
    ],
    popular: false
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, falling back to default seed:', err);
    }

    // Default seed
    const adminPass = process.env.ADMIN_PASSWORD || 'AdminLocalConnect2026!';
    const { passwordHash: adminHash, salt: adminSalt } = hashPassword(adminPass);

    const defaultData: DatabaseSchema = {
      users: initialDemoUsers,
      conversations: [
        {
          id: 'conv-demo-1',
          participantIds: ['demo-usr-1', 'demo-usr-2'],
          updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          lastMessage: {
            text: 'Hey! Loved your profile. Are you going to the art exhibit this weekend?',
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            senderId: 'demo-usr-2'
          }
        }
      ],
      messages: [
        {
          id: 'msg-demo-1',
          conversationId: 'conv-demo-1',
          senderId: 'demo-usr-1',
          receiverId: 'demo-usr-2',
          text: 'Hi Kabir! How are you doing today?',
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          read: true
        },
        {
          id: 'msg-demo-2',
          conversationId: 'conv-demo-1',
          senderId: 'demo-usr-2',
          receiverId: 'demo-usr-1',
          text: 'Hey! Loved your profile. Are you going to the art exhibit this weekend?',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: true
        }
      ],
      reports: [],
      blocks: [],
      plans: initialPlans,
      payments: [
        {
          id: 'pay_demo_seed_01',
          userId: 'demo-usr-1',
          userEmail: 'aanya.demo@localconnect.app',
          userName: 'Aanya Sharma',
          planId: 'plan_30_days',
          planName: '30 Days Monthly',
          amount: 299,
          currency: 'INR',
          status: 'Successful',
          orderId: 'order_seed_001',
          paymentId: 'pay_seed_001_mock',
          createdAt: '2026-08-11T12:00:00Z',
          verifiedAt: '2026-08-11T12:01:00Z',
          method: 'Razorpay UPI'
        }
      ],
      cities: initialCities,
      settings: {
        telegramInviteLink: process.env.TELEGRAM_INVITE_LINK || 'https://t.me/+LocalConnectVIPClub',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
        razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'YourRazorpaySecretKeyHere',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@localconnect.app',
        adminPasswordHash: adminHash,
        adminPasswordSalt: adminSalt
      }
    };

    this.save(defaultData);
    return defaultData;
  }

  public save(newData?: DatabaseSchema): void {
    if (newData) {
      this.data = newData;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();
