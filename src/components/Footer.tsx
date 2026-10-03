import React from 'react';
import { Heart, ShieldCheck, Lock, Send } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  openAdmin: () => void;
  onOpenTelegram: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, openAdmin, onOpenTelegram }) => {
  return (
    <footer className="w-full bg-stone-950 dark:bg-stone-950 light:bg-stone-100 border-t border-stone-900 dark:border-stone-900 light:border-stone-200 pt-12 pb-24 md:pb-12 text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Mandatory Safety Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 dark:bg-stone-900/80 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-stone-200 dark:text-stone-200 light:text-stone-900 uppercase tracking-wider text-[11px]">
                Strict 18+ Adult Policy & Community Standards
              </span>
              <p className="text-stone-300 dark:text-stone-300 light:text-stone-700 leading-relaxed text-xs">
                “This platform is strictly for adults aged 18 and above. Harassment, fraud, impersonation, exploitation, solicitation of sexual services, illegal activity and abusive behavior are prohibited.”
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-white dark:text-white light:text-stone-900 font-bold">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span>LocalConnect</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed mb-4">
              Modern local dating and safe messaging for verified adults. Discover real people in your city without publicizing private contact info.
            </p>
            <button
              onClick={onOpenTelegram}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-500/30 rounded-lg text-[11px] font-medium transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Join Our Telegram Community</span>
            </button>
          </div>

          <div>
            <h4 className="font-semibold text-stone-200 dark:text-stone-200 light:text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              Explore Cities
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => onNavigate('discover')} className="hover:text-rose-400 transition cursor-pointer">Delhi Singles</button></li>
              <li><button onClick={() => onNavigate('discover')} className="hover:text-rose-400 transition cursor-pointer">Mumbai Singles</button></li>
              <li><button onClick={() => onNavigate('discover')} className="hover:text-rose-400 transition cursor-pointer">Lucknow Singles</button></li>
              <li><button onClick={() => onNavigate('discover')} className="hover:text-rose-400 transition cursor-pointer">Kanpur Singles</button></li>
              <li><button onClick={() => onNavigate('discover')} className="hover:text-rose-400 transition cursor-pointer">Jaipur Singles</button></li>
              <li><button onClick={() => onNavigate('discover')} className="hover:text-rose-400 transition cursor-pointer">Bengaluru Singles</button></li>
              <li><button onClick={() => onNavigate('discover')} className="hover:text-rose-400 transition cursor-pointer">Hyderabad Singles</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-200 dark:text-stone-200 light:text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              Safety & Legal
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => onNavigate('terms')} className="hover:text-rose-400 transition cursor-pointer">Terms & Conditions</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-rose-400 transition cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('community-guidelines')} className="hover:text-rose-400 transition cursor-pointer">Community Guidelines</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-rose-400 transition cursor-pointer">About LocalConnect</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-rose-400 transition cursor-pointer">Contact Support</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-200 dark:text-stone-200 light:text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              Platform & Trust
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Strict 18+ Verification</span>
              </li>
              <li className="flex items-center gap-1.5 text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span>Zero Private Contact Sharing</span>
              </li>
              <li className="flex items-center gap-1.5 text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span>Razorpay Encrypted Billing</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={openAdmin}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-stone-400 hover:text-stone-200 bg-stone-900 rounded-lg text-[10px] border border-stone-800 transition cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Moderation Panel</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-stone-900 dark:border-stone-900 light:border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © {new Date().getFullYear()} LocalConnect. All rights reserved. Strictly 18+.
          </div>
          <div className="text-stone-500">
            Never send money or share bank details with anyone you meet online.
          </div>
        </div>
      </div>
    </footer>
  );
};
