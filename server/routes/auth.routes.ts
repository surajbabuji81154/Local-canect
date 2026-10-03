import { Router } from 'express';
import crypto from 'node:crypto';
import { db, hashPassword, verifyPassword } from '../db.ts';
import { createToken, requireAuth, revokeToken, sanitizeUser, type AuthenticatedRequest } from '../auth.ts';
import type { User } from '../../src/types/index.ts';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      city,
      avatar,
      bio,
      interests,
      gender,
      lookingFor,
      isAgeConfirmed
    } = req.body;

    // Strict 18+ validation
    if (!isAgeConfirmed) {
      res.status(400).json({ error: 'You must confirm that you are at least 18 years of age.' });
      return;
    }

    const numericAge = Number(age);
    if (isNaN(numericAge) || numericAge < 18) {
      res.status(400).json({ error: 'LocalConnect is strictly for adults aged 18 and older. Registration denied.' });
      return;
    }

    if (!email || !password || !name || !city) {
      res.status(400).json({ error: 'Please provide all required fields (Name, Email, Password, Age, City).' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const data = db.getData();

    const existingUser = data.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const { passwordHash, salt } = hashPassword(password);
    const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Clean avatar or fallback avatar
    const userAvatar = avatar && avatar.trim().length > 0
      ? avatar
      : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`;

    const newUser: User & { passwordHash: string; salt: string } = {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      age: numericAge,
      city: city.trim(),
      avatar: userAvatar,
      bio: (bio || 'Looking to connect with genuine adults in my city.').trim(),
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['Coffee', 'City Walks'],
      gender: gender || 'Not Specified',
      lookingFor: lookingFor || 'Everyone',
      isAgeConfirmed: true,
      isVerified: false,
      status: 'active',
      isPremium: false,
      premiumUntil: null,
      createdAt: new Date().toISOString(),
      lastActive: 'Online',
      isDemo: false,
      passwordHash,
      salt
    };

    data.users.push(newUser);
    db.save();

    const token = createToken(userId, false);
    const safe = sanitizeUser(newUser, true);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safe
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An internal server error occurred during registration.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const data = db.getData();
    const user = data.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'suspended' || user.status === 'blocked') {
      res.status(403).json({ error: 'Your account has been restricted by platform administration.' });
      return;
    }

    const isMatch = verifyPassword(password, user.passwordHash, user.salt);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    user.lastActive = 'Online';
    db.save();

    const token = createToken(user.id, false);
    const safe = sanitizeUser(user, true);

    res.json({
      message: 'Logged in successfully',
      token,
      user: safe
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: sanitizeUser(req.user, true) });
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    revokeToken(authHeader.substring(7));
  }
  res.json({ message: 'Logged out successfully' });
});

// DELETE /api/auth/delete-account
authRouter.delete('/delete-account', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const data = db.getData();

    // Remove user
    data.users = data.users.filter(u => u.id !== userId);

    // Remove messages and conversations involving user
    data.messages = data.messages.filter(m => m.senderId !== userId && m.receiverId !== userId);
    data.conversations = data.conversations.filter(c => !c.participantIds.includes(userId));

    // Remove blocks & reports
    data.blocks = data.blocks.filter(b => b.blockerId !== userId && b.blockedUserId !== userId);
    data.reports = data.reports.filter(r => r.reporterId !== userId);

    db.save();

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      revokeToken(authHeader.substring(7));
    }

    res.json({ message: 'Your account and all associated personal data have been permanently deleted.' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});
