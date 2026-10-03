import { Router } from 'express';
import crypto from 'node:crypto';
import { db, verifyPassword } from '../db.ts';
import { createToken, requireAdmin, type AuthenticatedRequest } from '../auth.ts';
import type { AdminStats, Plan, CityItem } from '../../src/types/index.ts';

export const adminRouter = Router();

// POST /api/admin/login
adminRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Admin email and password required.' });
      return;
    }

    const data = db.getData();
    const adminEmail = process.env.ADMIN_EMAIL || data.settings.adminEmail;

    if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
      res.status(401).json({ error: 'Invalid admin credentials.' });
      return;
    }

    // Verify password hash
    const isValid = verifyPassword(
      password,
      data.settings.adminPasswordHash,
      data.settings.adminPasswordSalt
    );

    // Fallback: also check against process.env.ADMIN_PASSWORD if set
    const envPass = process.env.ADMIN_PASSWORD;
    const isEnvMatch = envPass && envPass === password;

    if (!isValid && !isEnvMatch) {
      res.status(401).json({ error: 'Invalid admin credentials.' });
      return;
    }

    const token = createToken('admin_root_id', true);
    res.json({
      message: 'Admin session authenticated successfully',
      token,
      adminEmail
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin authentication failed.' });
  }
});

// GET /api/admin/stats
adminRouter.get('/stats', requireAdmin, (_req: AuthenticatedRequest, res) => {
  try {
    const data = db.getData();
    const totalUsers = data.users.length;
    const activeUsers = data.users.filter(u => u.status === 'active').length;
    const premiumUsers = data.users.filter(u => u.isPremium).length;
    const totalMessages = data.messages.length;
    const totalRevenue = data.payments
      .filter(p => p.status === 'Successful')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingReports = data.reports.filter(r => r.status === 'pending').length;
    const demoProfilesCount = data.users.filter(u => u.isDemo).length;

    const stats: AdminStats = {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalMessages,
      totalRevenue,
      pendingReports,
      demoProfilesCount
    };

    res.json({ stats });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

// GET /api/admin/users
adminRouter.get('/users', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { status, search, premium } = req.query;
    const data = db.getData();

    let users = [...data.users];

    if (status && status !== 'all') {
      users = users.filter(u => u.status === status);
    }

    if (premium === 'true') {
      users = users.filter(u => u.isPremium);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Hide password hashes from response
    const sanitized = users.map(({ passwordHash, salt, ...rest }) => rest);

    res.json({ users: sanitized });
  } catch (err) {
    console.error('Admin fetch users error:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// POST /api/admin/users/:id/action
adminRouter.post('/users/:id/action', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve', 'suspend', 'activate', 'verify_toggle', 'delete', 'grant_premium', 'revoke_premium'

    const data = db.getData();
    const userIndex = data.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const user = data.users[userIndex];

    switch (action) {
      case 'approve':
        user.status = 'active';
        user.isVerified = true;
        break;
      case 'suspend':
        user.status = 'suspended';
        break;
      case 'activate':
        user.status = 'active';
        break;
      case 'verify_toggle':
        user.isVerified = !user.isVerified;
        break;
      case 'grant_premium':
        user.isPremium = true;
        const until = new Date();
        until.setDate(until.getDate() + 30);
        user.premiumUntil = until.toISOString();
        break;
      case 'revoke_premium':
        user.isPremium = false;
        user.premiumUntil = null;
        break;
      case 'delete':
        data.users.splice(userIndex, 1);
        data.messages = data.messages.filter(m => m.senderId !== id && m.receiverId !== id);
        data.conversations = data.conversations.filter(c => !c.participantIds.includes(id));
        break;
      default:
        res.status(400).json({ error: 'Invalid moderation action.' });
        return;
    }

    db.save();
    res.json({ message: `Action "${action}" applied successfully.` });
  } catch (err) {
    console.error('Admin user action error:', err);
    res.status(500).json({ error: 'Failed to execute moderation action.' });
  }
});

// GET /api/admin/reports
adminRouter.get('/reports', requireAdmin, (_req: AuthenticatedRequest, res) => {
  try {
    const data = db.getData();
    const sorted = [...data.reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ reports: sorted });
  } catch (err) {
    console.error('Admin reports error:', err);
    res.status(500).json({ error: 'Failed to retrieve reports.' });
  }
});

// POST /api/admin/reports/:id/action
adminRouter.post('/reports/:id/action', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'resolve', 'dismiss'

    const data = db.getData();
    const report = data.reports.find(r => r.id === id);

    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    if (action === 'resolve') {
      report.status = 'resolved';
    } else if (action === 'dismiss') {
      report.status = 'dismissed';
    } else {
      res.status(400).json({ error: 'Invalid action for report.' });
      return;
    }

    db.save();
    res.json({ message: `Report marked as ${report.status}.` });
  } catch (err) {
    console.error('Admin report action error:', err);
    res.status(500).json({ error: 'Failed to update report.' });
  }
});

// GET /api/admin/plans
adminRouter.get('/plans', requireAdmin, (_req: AuthenticatedRequest, res) => {
  try {
    const data = db.getData();
    res.json({ plans: data.plans });
  } catch (err) {
    console.error('Admin plans error:', err);
    res.status(500).json({ error: 'Failed to retrieve plans.' });
  }
});

// PUT /api/admin/plans/:id
adminRouter.put('/plans/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { price, name, durationLabel, features } = req.body;

    const data = db.getData();
    const plan = data.plans.find(p => p.id === id);

    if (!plan) {
      res.status(404).json({ error: 'Subscription plan not found.' });
      return;
    }

    if (typeof price === 'number' && price >= 0) {
      plan.price = price;
    }
    if (name) plan.name = name;
    if (durationLabel) plan.durationLabel = durationLabel;
    if (Array.isArray(features)) plan.features = features;

    db.save();
    res.json({ message: 'Plan details updated successfully.', plan });
  } catch (err) {
    console.error('Admin plan update error:', err);
    res.status(500).json({ error: 'Failed to update plan.' });
  }
});

// GET /api/admin/payments
adminRouter.get('/payments', requireAdmin, (_req: AuthenticatedRequest, res) => {
  try {
    const data = db.getData();
    const sorted = [...data.payments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ payments: sorted });
  } catch (err) {
    console.error('Admin payments error:', err);
    res.status(500).json({ error: 'Failed to retrieve payments.' });
  }
});

// GET /api/admin/settings
adminRouter.get('/settings', requireAdmin, (_req: AuthenticatedRequest, res) => {
  try {
    const data = db.getData();
    res.json({
      telegramInviteLink: data.settings.telegramInviteLink,
      razorpayKeyId: data.settings.razorpayKeyId,
      adminEmail: data.settings.adminEmail
    });
  } catch (err) {
    console.error('Admin settings error:', err);
    res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
});

// PUT /api/admin/settings
adminRouter.put('/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { telegramInviteLink, razorpayKeyId, razorpayKeySecret } = req.body;
    const data = db.getData();

    if (telegramInviteLink && typeof telegramInviteLink === 'string') {
      data.settings.telegramInviteLink = telegramInviteLink.trim();
    }
    if (razorpayKeyId && typeof razorpayKeyId === 'string') {
      data.settings.razorpayKeyId = razorpayKeyId.trim();
    }
    if (razorpayKeySecret && typeof razorpayKeySecret === 'string') {
      data.settings.razorpayKeySecret = razorpayKeySecret.trim();
    }

    db.save();
    res.json({ message: 'Platform settings updated successfully.' });
  } catch (err) {
    console.error('Admin settings update error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// GET /api/admin/cities
adminRouter.get('/cities', (_req, res) => {
  try {
    const data = db.getData();
    res.json({ cities: data.cities });
  } catch (err) {
    console.error('Cities error:', err);
    res.status(500).json({ error: 'Failed to retrieve cities.' });
  }
});

// POST /api/admin/cities
adminRouter.post('/cities', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { name, state } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'City name is required.' });
      return;
    }

    const data = db.getData();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (data.cities.some(c => c.id === id || c.name.toLowerCase() === name.toLowerCase())) {
      res.status(409).json({ error: 'City already exists.' });
      return;
    }

    const newCity: CityItem = {
      id,
      name: name.trim(),
      state: (state || '').trim(),
      active: true
    };

    data.cities.push(newCity);
    db.save();

    res.status(201).json({ message: 'City added successfully.', city: newCity });
  } catch (err) {
    console.error('Add city error:', err);
    res.status(500).json({ error: 'Failed to add city.' });
  }
});

// PUT /api/admin/cities/:id
adminRouter.put('/cities/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { active, name, state } = req.body;

    const data = db.getData();
    const city = data.cities.find(c => c.id === id);

    if (!city) {
      res.status(404).json({ error: 'City not found.' });
      return;
    }

    if (typeof active === 'boolean') city.active = active;
    if (name) city.name = name.trim();
    if (state) city.state = state.trim();

    db.save();
    res.json({ message: 'City updated successfully.', city });
  } catch (err) {
    console.error('Update city error:', err);
    res.status(500).json({ error: 'Failed to update city.' });
  }
});
