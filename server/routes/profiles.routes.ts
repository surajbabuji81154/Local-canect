import { Router } from 'express';
import { db } from '../db.ts';
import { requireAuth, sanitizeUser, verifyToken, type AuthenticatedRequest } from '../auth.ts';

export const profilesRouter = Router();

// GET /api/profiles - Discover profiles with filters
profilesRouter.get('/', (req, res) => {
  try {
    const { city, minAge, maxAge, interest, search } = req.query;

    // Optional auth to filter out current user and blocked profiles
    let currentUserId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { valid, userId } = verifyToken(authHeader.substring(7));
      if (valid && userId) {
        currentUserId = userId;
      }
    }

    const data = db.getData();
    let blockedIds: string[] = [];

    if (currentUserId) {
      // Find all users blocked by current user or who blocked current user
      const blocks = data.blocks.filter(b => b.blockerId === currentUserId || b.blockedUserId === currentUserId);
      blockedIds = blocks.map(b => b.blockerId === currentUserId ? b.blockedUserId : b.blockerId);
    }

    let profiles = data.users.filter(u => {
      // Don't show suspended or blocked accounts
      if (u.status !== 'active') return false;
      // Don't show self
      if (currentUserId && u.id === currentUserId) return false;
      // Don't show mutually blocked
      if (blockedIds.includes(u.id)) return false;
      return true;
    });

    // Filter by city
    if (city && typeof city === 'string' && city !== 'All') {
      profiles = profiles.filter(u => u.city.toLowerCase() === city.toLowerCase());
    }

    // Filter by minAge
    if (minAge) {
      const min = parseInt(minAge as string, 10);
      if (!isNaN(min)) {
        profiles = profiles.filter(u => u.age >= min);
      }
    }

    // Filter by maxAge
    if (maxAge) {
      const max = parseInt(maxAge as string, 10);
      if (!isNaN(max)) {
        profiles = profiles.filter(u => u.age <= max);
      }
    }

    // Filter by interest
    if (interest && typeof interest === 'string' && interest !== 'All') {
      profiles = profiles.filter(u =>
        u.interests.some(i => i.toLowerCase().includes((interest as string).toLowerCase()))
      );
    }

    // Filter by general search keyword
    if (search && typeof search === 'string') {
      const q = (search as string).toLowerCase().trim();
      profiles = profiles.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.interests.some(i => i.toLowerCase().includes(q))
      );
    }

    // Return sanitized profiles without sensitive contact information
    const sanitized = profiles.map(u => sanitizeUser(u, false));
    res.json({ profiles: sanitized, count: sanitized.length });
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ error: 'Failed to retrieve profiles.' });
  }
});

// GET /api/profiles/:id - Single profile details
profilesRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = db.getData();
    const user = data.users.find(u => u.id === id);

    if (!user || user.status !== 'active') {
      res.status(404).json({ error: 'Profile not found or currently unavailable.' });
      return;
    }

    // Return sanitized public view
    res.json({ profile: sanitizeUser(user, false) });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile details.' });
  }
});

// PUT /api/profiles/me - Update own profile
profilesRouter.put('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, bio, interests, city, avatar, gender, lookingFor } = req.body;
    const data = db.getData();
    const target = data.users.find(u => u.id === user.id);

    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (name && typeof name === 'string') target.name = name.trim();
    if (bio && typeof bio === 'string') target.bio = bio.trim();
    if (Array.isArray(interests)) target.interests = interests;
    if (city && typeof city === 'string') target.city = city.trim();
    if (avatar && typeof avatar === 'string') target.avatar = avatar.trim();
    if (gender && typeof gender === 'string') target.gender = gender;
    if (lookingFor && typeof lookingFor === 'string') target.lookingFor = lookingFor;

    target.lastActive = 'Online';
    db.save();

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(target, true)
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});
