import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle2, ShieldCheck, Sparkles, Send, ArrowRight, Zap, RefreshCw, Lock } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import type { Plan, PaymentRecord } from '../types/index.ts';

interface PremiumPageProps {
  onSelectPlan: (plan: Plan) => void;
  onOpenTelegram: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({
  onSelectPlan,
  onOpenTelegram,
  openAuthModal
}) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getPlans();
        setPlans(res.plans);

        if (user) {
          const statusRes = await api.getMyPaymentStatus();
          setPaymentHistory(statusRes.payments);
        }
      } catch (err) {
        console.error('Error loading plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handlePayClick = (plan: Plan) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    onSelectPlan(plan);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 fill-amber-300" />
          <span>LocalConnect VIP Membership</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white dark:text-white light:text-stone-900">
          Elevate Your Local Connections
        </h1>

        <p className="text-xs sm:text-sm text-stone-300 dark:text-stone-300 light:text-stone-600 leading-relaxed">
          Unlock unlimited direct messages, priority spotlight in your city, and instant access to our private VIP Telegram community.
        </p>

        {user?.isPremium && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl max-w-md mx-auto text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Active Premium until: <strong>{user.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString() : 'Permanent'}</strong>
              </span>
            </div>
            <button
              onClick={onOpenTelegram}
              className="text-xs font-bold text-white underline hover:no-underline flex items-center gap-1"
            >
              <span>Telegram VIP</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Prominent Telegram Community Access Button */}
      <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-gradient-to-r from-sky-950/60 via-stone-900 to-sky-950/40 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Join Our Telegram Community</h3>
            <p className="text-xs text-stone-300">
              Verified 18+ singles discussions, city events & announcements.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTelegram}
          className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/30 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Join Our Telegram Community</span>
        </button>
      </div>

      {/* Plans Pricing Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
          <span>Loading subscription plans...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(plan => {
            const isPopular = plan.popular || plan.days === 7;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-rose-500 shadow-2xl shadow-rose-950/30 scale-[1.02]'
                    : 'bg-stone-900/80 dark:bg-stone-900/80 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white dark:text-white light:text-stone-900">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Full access for {plan.durationLabel}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white dark:text-white light:text-stone-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-stone-400">
                      / {plan.durationLabel}
                    </span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 pt-2 border-t border-stone-800/80 dark:border-stone-800/80 light:border-stone-200">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-stone-300 dark:text-stone-300 light:text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handlePayClick(plan)}
                    className={`w-full py-3.5 px-4 font-semibold text-xs rounded-xl uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                        : 'bg-stone-800 hover:bg-stone-700 text-white shadow-black/20'
                    }`}
                  >
                    <span>Pay Now · ₹{plan.price}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-stone-500 text-center mt-2">
                    Verified Razorpay 256-Bit SSL Checkout
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment History Table (If User has transactions) */}
      {user && paymentHistory.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-white">Your Payment History</h3>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-950 text-stone-400 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {paymentHistory.map(pay => (
                    <tr key={pay.id} className="hover:bg-stone-800/40">
                      <td className="p-3.5 font-medium text-white">{pay.planName}</td>
                      <td className="p-3.5">₹{pay.amount}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pay.status === 'Successful'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : pay.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-stone-400">{pay.orderId}</td>
                      <td className="p-3.5 text-stone-500">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security & Refund Guarantee */}
      <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-center text-xs text-stone-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-stone-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real Server-Side Cryptographic Verification</span>
        </div>
        <p className="text-[11px]">
          All payments are verified on our secure backend with HMAC-SHA256 signature checking. Subscriptions activate instantly upon verification.
        </p>
      </div>
    </div>
  );
};
