import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle2, ShieldCheck, X, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import type { Plan } from '../types/index.ts';

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: (telegramLink?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    isLiveGateway: boolean;
  } | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);

  // Load Razorpay Checkout SDK script dynamically
  useEffect(() => {
    const scriptId = 'razorpay-checkout-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const initiatePayment = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on server
      const order = await api.createOrder(plan.id);
      setOrderData(order);

      // 2. Check if real Razorpay gateway is ready
      const Razorpay = (window as any).Razorpay;

      if (order.isLiveGateway && Razorpay) {
        // Real Razorpay Checkout flow
        const options = {
          key: order.keyId,
          amount: Math.round(order.amount * 100),
          currency: 'INR',
          name: 'LocalConnect Premium',
          description: `${plan.name} (${plan.durationLabel})`,
          order_id: order.orderId,
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#e11d48',
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            await handleVerifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setError(resp.error?.description || 'Payment was declined by bank/gateway.');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Test / Sandbox mode with server-side validation
        // Ready for direct verification
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment gateway.');
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    setLoading(true);
    setError(null);

    try {
      // Server-side cryptographic HMAC verification
      const verifyRes = await api.verifyPayment({
        orderId,
        paymentId,
        signature,
      });

      await refreshUser();
      setVerificationSuccess(true);
      if (verifyRes.telegramLink) {
        setTelegramLink(verifyRes.telegramLink);
      }
      onSuccess(verifyRes.telegramLink);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed on server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSandboxPayment = async () => {
    if (!orderData) return;
    const testPaymentId = `pay_test_${Date.now()}`;
    const testSignature = `sig_valid_${Date.now()}`;
    await handleVerifyPayment(orderData.orderId, testPaymentId, testSignature);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-7 text-stone-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {verificationSuccess ? (
          <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white">Payment Verified!</h3>
            <p className="text-xs text-stone-300 max-w-sm mx-auto">
              Your {plan.name} has been activated via server-side verification. You now have unlimited chat and priority matching.
            </p>

            {telegramLink && (
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl text-left space-y-2.5 mt-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>VIP Telegram Community Access Unlocked</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  As a verified premium member, you are invited to join our private, moderated Telegram community.
                </p>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Join Our Telegram Community</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white font-medium text-xs rounded-xl transition"
            >
              Continue to LocalConnect
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-white">₹{plan.price}</span>
                  <span className="text-xs text-stone-400">/ {plan.durationLabel}</span>
                </div>
              </div>
            </div>

            {/* Perks */}
            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Included in this plan:
              </div>
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-stone-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Gateway notice */}
            <div className="text-[11px] text-stone-400 flex items-start gap-2 bg-stone-900/50 p-2.5 rounded-lg border border-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-300">Bank-Grade 256-Bit SSL Encryption</strong>
                <p className="mt-0.5">
                  Supports UPI, Credit/Debit Cards, NetBanking, and Wallets via Razorpay gateway.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            {!orderData ? (
              <button
                onClick={initiatePayment}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Initializing Razorpay...' : `Pay ₹${plan.price} Now`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Order ID:</span>
                    <span className="font-mono text-stone-300">{orderData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Gateway Mode:</span>
                    <span className="font-medium text-amber-400">
                      {orderData.isLiveGateway ? 'Razorpay Live' : 'Test / Sandbox Mode'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateSandboxPayment}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25"
                >
                  <span>{loading ? 'Verifying on Server...' : 'Confirm Payment & Verify Signature'}</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
