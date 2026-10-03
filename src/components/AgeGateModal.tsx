import React from 'react';
import { ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AgeGateModalProps {
  onConfirm?: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onConfirm }) => {
  const { isAdultConfirmed, confirmAdultAge } = useAuth();

  if (isAdultConfirmed) return null;

  const handleConfirm = () => {
    confirmAdultAge();
    if (onConfirm) onConfirm();
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 text-stone-100 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-block px-3 py-1 mb-3 rounded-md bg-rose-500/20 text-rose-300 text-xs font-semibold tracking-wider uppercase">
          Strictly 18+ Adult Community
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Age Verification Required
        </h2>

        <p className="text-stone-300 text-sm leading-relaxed mb-6">
          LocalConnect is a private, verified local dating and chat community exclusively for consenting adults aged <strong className="text-white">18 years or older</strong>. 
          By entering, you confirm you are of legal adult age in your jurisdiction.
        </p>

        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 mb-6 text-xs text-stone-400 text-left space-y-1.5">
          <div className="flex items-center gap-2 text-stone-300 font-medium">
            <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Underage access is strictly prohibited & monitored</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300 font-medium">
            <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Zero tolerance for harassment, fraud, or solicitation</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 px-5 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>I am 18 or older · Enter Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleExit}
            className="w-full py-2.5 px-4 text-stone-400 hover:text-stone-200 text-xs font-medium transition cursor-pointer"
          >
            I am under 18 — Exit to Google
          </button>
        </div>
      </div>
    </div>
  );
};
