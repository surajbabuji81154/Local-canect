import React, { useState, useEffect } from 'react';
import { Send, ShieldCheck, X, ExternalLink, Lock } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface TelegramCommunityModalProps {
  onClose: () => void;
  onOpenPremium: () => void;
}

export const TelegramCommunityModal: React.FC<TelegramCommunityModalProps> = ({
  onClose,
  onOpenPremium
}) => {
  const { user } = useAuth();
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLink() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getTelegramLink();
        setTelegramLink(res.telegramInviteLink);
      } catch (err: any) {
        setError(err.message || 'VIP community link is reserved for verified Premium members.');
      } finally {
        setLoading(false);
      }
    }
    fetchLink();
  }, [user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-7 text-stone-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
          <Send className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-center text-white mb-2">
          LocalConnect Telegram VIP
        </h3>

        <p className="text-xs text-stone-300 text-center leading-relaxed mb-6">
          Connect directly with verified local singles, hear about private weekend meetups, and get instant updates in our moderated 18+ community.
        </p>

        {loading ? (
          <div className="py-6 text-center text-xs text-stone-400">
            Checking verification status...
          </div>
        ) : telegramLink ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-stone-300">
                <strong className="text-emerald-300">Verified Member Access</strong>
                <p className="text-[11px] text-stone-400">
                  Your private invite link has been generated securely.
                </p>
              </div>
            </div>

            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/30"
            >
              <span>Join Our Telegram Community</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-300">
                <strong className="text-amber-300">Premium Verification Required</strong>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  To protect our members from fake profiles and bot spam, the private Telegram invite link is exclusively visible to verified premium members.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenPremium();
              }}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-rose-600/25"
            >
              <span>Unlock with Premium (from ₹49)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
