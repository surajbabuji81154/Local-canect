import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import type { User, SafeUser } from '../src/types/index.ts';

const SESSION_SECRET = process.env.SESSION_SECRET || 'localconnect_super_secret_session_key_2026';

// In-memory active tokens mapping: token -> { userId: string, expiresAt: number }
interface SessionData {
  userId: string;
  isAdmin?: boolean;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionData>();

export function createToken(userId: string, isAdmin = false): string {
  const payload = `${userId}:${isAdmin ? 'admin' : 'user'}:${Date.now()}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${hmac}`).toString('base64url');
  
  // Expire in 7 days
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  activeSessions.set(token, { userId, isAdmin, expiresAt });
  return token;
}

export function verifyToken(token: string): { valid: boolean; userId?: string; isAdmin?: boolean } {
  try {
    const session = activeSessions.get(token);
    if (session && session.expiresAt > Date.now()) {
      return { valid: true, userId: session.userId, isAdmin: session.isAdmin };
    }

    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 4) return { valid: false };

    const userId = parts[0];
    const role = parts[1];
    const timestamp = parts[2];
    const signature = parts[3];

    const payload = `${userId}:${role}:${timestamp}`;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return { valid: true, userId, isAdmin: role === 'admin' };
    }
  } catch (err) {
    // invalid token
  }
  return { valid: false };
}

export function revokeToken(token: string): void {
  activeSessions.delete(token);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  isAdmin?: boolean;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.substring(7);
  const { valid, userId } = verifyToken(token);

  if (!valid || !userId) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }

  const data = db.getData();
  const user = data.users.find(u => u.id === userId);

  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }

  if (user.status === 'suspended' || user.status === 'blocked') {
    res.status(403).json({ error: 'Your account has been suspended or restricted by moderation.' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Admin authorization required.' });
    return;
  }

  const token = authHeader.substring(7);
  const { valid, isAdmin } = verifyToken(token);

  if (!valid || !isAdmin) {
    res.status(403).json({ error: 'Access denied: Admin privileges required.' });
    return;
  }

  req.isAdmin = true;
  next();
}

export function sanitizeUser(user: User & { passwordHash?: string; hash?: string; salt?: string }, includePrivate = false): SafeUser {
  const { passwordHash, hash, salt, ...rest } = user;
  if (!includePrivate) {
    const { email, ...publicProfile } = rest;
    return publicProfile;
  }
  return rest;
}

// In-memory rate limiting map for messaging and API abuse
const requestTracker = new Map<string, number[]>();

export function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${ip}_${req.baseUrl || ''}`;
    const now = Date.now();

    const timestamps = (requestTracker.get(key) || []).filter(t => now - t < windowMs);
    if (timestamps.length >= limit) {
      res.status(429).json({ error: 'Too many requests. Please slow down.' });
      return;
    }

    timestamps.push(now);
    requestTracker.set(key, timestamps);
    next();
  };
}

// Basic anti-spam & abuse detector
const abusiveWords = [
  'kill', 'rape', 'threat', 'escort', 'sex for cash', 'prostitute', 'solicit', 'underage', 'minor'
];

export function containsAbusiveContent(text: string): boolean {
  const lower = text.toLowerCase();
  return abusiveWords.some(w => lower.includes(w));
}
