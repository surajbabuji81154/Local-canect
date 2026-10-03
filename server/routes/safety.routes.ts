import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';
import type { Report, Block } from '../../src/types/index.ts';

export const safetyRouter = Router();

// POST /api/safety/report - Report a user
safetyRouter.post('/report', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const reporter = req.user!;
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason) {
      res.status(400).json({ error: 'Reported user ID and reason are required.' });
      return;
    }

    if (reportedUserId === reporter.id) {
      res.status(400).json({ error: 'You cannot report your own profile.' });
      return;
    }

    const data = db.getData();
    const reportedUser = data.users.find(u => u.id === reportedUserId);

    const newReport: Report = {
      id: `rep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reportedUserId,
      reportedUserName: reportedUser ? reportedUser.name : 'Unknown User',
      reason: reason.trim(),
      details: (details || '').trim(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    data.reports.push(newReport);
    db.save();

    res.status(201).json({
      message: 'Thank you for your report. Our moderation team investigates all safety concerns within 24 hours.',
      reportId: newReport.id
    });
  } catch (err) {
    console.error('Safety report error:', err);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// POST /api/safety/block - Block a user
safetyRouter.post('/block', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const blocker = req.user!;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user ID is required.' });
      return;
    }

    if (targetUserId === blocker.id) {
      res.status(400).json({ error: 'You cannot block yourself.' });
      return;
    }

    const data = db.getData();

    const existing = data.blocks.find(
      b => b.blockerId === blocker.id && b.blockedUserId === targetUserId
    );

    if (!existing) {
      const newBlock: Block = {
        id: `blk_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        blockerId: blocker.id,
        blockedUserId: targetUserId,
        createdAt: new Date().toISOString()
      };
      data.blocks.push(newBlock);

      // Also clean up any active conversation between them
      data.conversations = data.conversations.filter(
        c => !(c.participantIds.includes(blocker.id) && c.participantIds.includes(targetUserId))
      );

      db.save();
    }

    res.json({ message: 'User has been blocked. They can no longer see your profile or contact you.' });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ error: 'Failed to block user.' });
  }
});

// DELETE /api/safety/block/:userId - Unblock a user
safetyRouter.delete('/block/:userId', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const blocker = req.user!;
    const targetUserId = req.params.userId;

    const data = db.getData();
    const initialLen = data.blocks.length;
    data.blocks = data.blocks.filter(
      b => !(b.blockerId === blocker.id && b.blockedUserId === targetUserId)
    );

    if (data.blocks.length < initialLen) {
      db.save();
    }

    res.json({ message: 'User has been unblocked.' });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ error: 'Failed to unblock user.' });
  }
});

// GET /api/safety/blocks - List all users blocked by current user
safetyRouter.get('/blocks', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const data = db.getData();
    const blocks = data.blocks.filter(b => b.blockerId === userId);
    res.json({ blocks });
  } catch (err) {
    console.error('Get blocks error:', err);
    res.status(500).json({ error: 'Failed to get blocks.' });
  }
});
