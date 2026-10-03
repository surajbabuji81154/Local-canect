import React from 'react';
import { ArrowRight, ShieldCheck, Heart, MapPin, MessageSquare, Sparkles, Users, Crown, Send, CheckCircle2 } from 'lucide-react';
import type { SafeUser, CityItem } from '../types/index.ts';

interface HomePageProps {
  onJoinNow: () => void;
  onExploreProfiles: (cityFilter?: string) => void;
  featuredProfiles: SafeUser[];
  cities: CityItem[];
  onOpenTelegram: () => void;
  onViewProfile: (profile: SafeUser) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onJoinNow,
  onExploreProfiles,
  featuredProfiles,
  cities,
  onOpenTelegram,
  onViewProfile
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-14 pb-12 sm:pb-20">
        {/* Ambient subtle glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-rose-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* 18+ Verified Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Strictly Verified 18+ Local Community</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white dark:text-white light:text-stone-900 leading-[1.1]">
            Meet New People <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
              Near You
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-stone-300 dark:text-stone-300 light:text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect, chat and discover people in your city.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onJoinNow}
              className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-semibold text-sm rounded-2xl transition shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Join Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onExploreProfiles()}
              className="w-full sm:w-auto px-8 py-4 bg-stone-900/90 dark:bg-stone-900/90 light:bg-white hover:bg-stone-800 dark:hover:bg-stone-800 light:hover:bg-stone-100 text-stone-200 dark:text-stone-200 light:text-stone-800 font-semibold text-sm rounded-2xl border border-stone-800 dark:border-stone-800 light:border-stone-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Profiles</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-400 dark:text-stone-400 light:text-stone-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
              100% Verified Adults
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
              No Phone or Address Shared
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
              Zero Tolerance for Spam
            </span>
          </div>
        </div>
      </section>

      {/* 2. City Quick Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white light:text-stone-900">
              Browse Active Singles By City
            </h2>
            <p className="text-xs text-stone-400">
              Real adult singles living near you right now
            </p>
          </div>
          <button
            onClick={() => onExploreProfiles()}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <span>View All Cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {cities.slice(0, 7).map(c => (
            <button
              key={c.id}
              onClick={() => onExploreProfiles(c.name)}
              className="p-4 rounded-2xl bg-stone-900/60 dark:bg-stone-900/60 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200 hover:border-rose-500/50 hover:bg-stone-900 transition text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-stone-200 dark:text-stone-200 light:text-stone-900 group-hover:text-rose-400 transition-colors">
                {c.name}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5 truncate">
                {c.state || 'Local Singles'}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Verified Singles Preview */}
      {featuredProfiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white light:text-stone-900">
                  Featured Local Profiles
                </h2>
                <span className="text-[10px] text-stone-400 border border-stone-800 px-2 py-0.5 rounded">
                  DEMO DATA
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Verified adults ready to chat and meet
              </p>
            </div>
            <button
              onClick={() => onExploreProfiles()}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProfiles.slice(0, 4).map(p => (
              <div
                key={p.id}
                onClick={() => onViewProfile(p)}
                className="group relative bg-stone-900/80 rounded-2xl overflow-hidden border border-stone-800 hover:border-rose-500/40 transition duration-300 cursor-pointer shadow-lg shadow-black/20"
              >
                <div className="aspect-[3/4] overflow-hidden bg-stone-950 relative">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                  <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-[10px] font-semibold text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    DEMO DATA
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-base">{p.name}</span>
                      <span className="text-rose-300 text-sm font-semibold">{p.age}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-300">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{p.city}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 text-xs text-stone-300 line-clamp-1">
                  {p.bio}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Why LocalConnect - Safe, Adult & Direct */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-900/60 dark:bg-stone-900/60 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-stone-900">
              Dating Built For Adults Who Value Privacy
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              We eliminate fake bots, endless algorithms, and risky exposure. Only genuine, verified adults in your city.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-950/50 border border-stone-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Strict 18+ Verification</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Minors are strictly barred. Our moderation team actively removes suspicious or abusive accounts immediately.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-950/50 border border-stone-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">City-Level Privacy</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                We only show your city. Your exact home address, phone number, and personal email are never shared publicly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-950/50 border border-stone-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Real-Time Safe Chat</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Message directly on the platform with built-in unmatching, instant blocking, and rapid abuse reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Telegram VIP Community Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-sky-950/60 via-stone-900 to-rose-950/50 border border-stone-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold">
              <Send className="w-3.5 h-3.5" />
              <span>Official Telegram Community</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Join Our Verified Adults VIP Channel
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Meet other verified singles, participate in city discussions, and stay updated. Available to verified members.
            </p>
          </div>

          <button
            onClick={onOpenTelegram}
            className="w-full md:w-auto px-7 py-3.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/30 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Join Our Telegram Community</span>
          </button>
        </div>
      </section>
    </div>
  );
};
