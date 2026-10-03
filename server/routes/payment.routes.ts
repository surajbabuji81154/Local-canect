import { Router } from 'express';
import { db } from '../db.ts';
import { paymentService } from '../razorpay.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const paymentRouter = Router();

// GET /api/payments/plans - Get available subscription plans
paymentRouter.get('/plans', (_req, res) => {
  try {
    const data = db.getData();
    res.json({
      plans: data.plans,
      razorpayKeyId: paymentService.getPublicKey(),
      isLiveGateway: paymentService.isConfigured()
    });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Failed to retrieve subscription plans.' });
  }
});

// POST /api/payments/create-order - Create Razorpay payment order
paymentRouter.post('/create-order', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { planId } = req.body;

    if (!planId) {
      res.status(400).json({ error: 'Plan ID is required.' });
      return;
    }

    const orderData = await paymentService.createOrder({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      planId
    });

    res.json(orderData);
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to initiate order.' });
  }
});

// POST /api/payments/verify - Server-side cryptographic payment verification
paymentRouter.post('/verify', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      res.status(400).json({
        error: 'Incomplete payment verification payload (orderId, paymentId, signature are required).'
      });
      return;
    }

    const result = paymentService.verifyPayment({
      orderId,
      paymentId,
      signature,
      userId: user.id
    });

    if (!result.success) {
      res.status(400).json({
        error: result.error || 'Payment verification failed. Your card or account was not charged.'
      });
      return;
    }

    res.json({
      message: 'Payment successfully verified! Premium subscription activated.',
      isPremium: true,
      premiumUntil: result.premiumUntil,
      telegramLink: result.telegramLink
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Internal server error verifying transaction.' });
  }
});

// GET /api/payments/telegram-link - Fetch Telegram link (ONLY for verified paid users or admin)
paymentRouter.get('/telegram-link', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    if (!user.isPremium) {
      res.status(403).json({
        error: 'Telegram VIP community link is exclusively available to verified Premium members.'
      });
      return;
    }

    const data = db.getData();
    res.json({
      telegramInviteLink: data.settings.telegramInviteLink
    });
  } catch (err) {
    console.error('Error fetching Telegram link:', err);
    res.status(500).json({ error: 'Failed to retrieve Telegram link.' });
  }
});

// GET /api/payments/my-status - User's subscription & transaction history
paymentRouter.get('/my-status', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const data = db.getData();

    const userPayments = data.payments
      .filter(p => p.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      payments: userPayments
    });
  } catch (err) {
    console.error('Error fetching payment status:', err);
    res.status(500).json({ error: 'Failed to retrieve payment status.' });
  }
});
