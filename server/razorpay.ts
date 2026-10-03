import crypto from 'node:crypto';
import { db } from './db.ts';
import type { PaymentRecord } from '../src/types/index.ts';

export interface CreateOrderParams {
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
}

export class PaymentService {
  private getKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || db.getData().settings.razorpayKeyId || 'rzp_test_YourKeyIdHere';
  }

  private getKeySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || db.getData().settings.razorpayKeySecret || 'YourRazorpaySecretKeyHere';
  }

  public isConfigured(): boolean {
    const key = this.getKeyId();
    const secret = this.getKeySecret();
    return Boolean(key && secret && !key.includes('YourKeyId') && !secret.includes('YourRazorpaySecret'));
  }

  public getPublicKey(): string {
    return this.getKeyId();
  }

  /**
   * Creates an order with Razorpay or sets up order tracking
   */
  public async createOrder(params: CreateOrderParams): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    plan: { id: string; name: string; days: number; price: number };
    isLiveGateway: boolean;
  }> {
    const data = db.getData();
    const plan = data.plans.find(p => p.id === params.planId);
    if (!plan) {
      throw new Error('Selected subscription plan not found');
    }

    const amountInPaise = Math.round(plan.price * 100);
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();

    let razorpayOrderId = '';
    const isLive = this.isConfigured();

    if (isLive) {
      // Call official Razorpay Orders API
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}_${params.userId.slice(-6)}`,
          notes: {
            userId: params.userId,
            planId: plan.id,
            planName: plan.name
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Razorpay API order creation failed:', errorText);
        throw new Error(`Payment gateway order failed: ${response.statusText}`);
      }

      const orderData = await response.json() as { id: string };
      razorpayOrderId = orderData.id;
    } else {
      // Development / sandbox test order ID
      razorpayOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    const paymentRecord: PaymentRecord = {
      id: `pay_rec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: 'INR',
      status: 'Pending',
      orderId: razorpayOrderId,
      createdAt: new Date().toISOString()
    };

    data.payments.push(paymentRecord);
    db.save();

    return {
      orderId: razorpayOrderId,
      amount: plan.price,
      currency: 'INR',
      keyId,
      plan: {
        id: plan.id,
        name: plan.name,
        days: plan.days,
        price: plan.price
      },
      isLiveGateway: isLive
    };
  }

  /**
   * Secure server-side signature verification
   * Follows standard Razorpay formula: HMAC SHA256 of (order_id + "|" + payment_id) with RAZORPAY_KEY_SECRET
   */
  public verifyPayment(params: VerifyPaymentParams): {
    success: boolean;
    error?: string;
    premiumUntil?: string;
    telegramLink?: string;
  } {
    const data = db.getData();
    const payment = data.payments.find(p => p.orderId === params.orderId && p.userId === params.userId);

    if (!payment) {
      return { success: false, error: 'Payment transaction record not found' };
    }

    if (payment.status === 'Successful') {
      return {
        success: true,
        telegramLink: data.settings.telegramInviteLink
      };
    }

    const keySecret = this.getKeySecret();
    const isLive = this.isConfigured();

    let verified = false;

    if (isLive) {
      try {
        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${params.orderId}|${params.paymentId}`)
          .digest('hex');

        verified = crypto.timingSafeEqual(
          Buffer.from(generatedSignature),
          Buffer.from(params.signature)
        );
      } catch (err) {
        console.error('Signature validation error:', err);
        verified = false;
      }
    } else {
      // In sandbox mode with placeholder keys:
      // Check that a valid payment ID and signature format was supplied
      if (params.paymentId && params.signature) {
        verified = true;
      }
    }

    if (!verified) {
      payment.status = 'Failed';
      db.save();
      return { success: false, error: 'Cryptographic signature verification failed' };
    }

    // Payment is valid! Update status
    payment.status = 'Successful';
    payment.paymentId = params.paymentId;
    payment.signature = params.signature;
    payment.verifiedAt = new Date().toISOString();
    payment.method = isLive ? 'Razorpay Live' : 'Razorpay Sandbox';

    // Find the user and activate premium
    const user = data.users.find(u => u.id === params.userId);
    if (user) {
      const plan = data.plans.find(p => p.id === payment.planId);
      const days = plan ? plan.days : 30;

      // If user currently has active premium, add to existing time
      let baseDate = new Date();
      if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) {
        baseDate = new Date(user.premiumUntil);
      }
      baseDate.setDate(baseDate.getDate() + days);

      user.isPremium = true;
      user.premiumUntil = baseDate.toISOString();
    }

    db.save();

    return {
      success: true,
      premiumUntil: user?.premiumUntil || undefined,
      telegramLink: data.settings.telegramInviteLink
    };
  }
}

export const paymentService = new PaymentService();
