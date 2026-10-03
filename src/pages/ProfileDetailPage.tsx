import React from 'react';
import { ArrowLeft, MapPin, CheckCircle2, MessageSquare, Ban, AlertTriangle, ShieldCheck, Heart, Crown, Sparkles } from 'lucide-react';
import type { SafeUser } from '../types/index.ts';

interface ProfileDetailPageProps {
  profile: SafeUser;
  onBack: () => void;
  onMessage: (profile: SafeUser) => void;
  onBlock: (profile: SafeUser) => void;
  onReport: (profile: SafeUser) => void;
  onLike?: (profile: SafeUser) => void;
  isLiked?: boolean;
}

export const ProfileDetailPage: React.FC<ProfileDetailPageProps> = ({
  profile,
  onBack,
  onMessage,
  onBlock,
  onReport,
  onLike,
  isLiked = false
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discover</span>
      </button>

      {/* Main Profile Card */}
      <div className="bg-stone-900/90 dark:bg-stone-900/90 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Photo Column */}
          <div className="md:col-span-5 relative aspect-[4/5] md:aspect-auto md:min-h-[460px] overflow-hidden bg-stone-950">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent md:hidden" />

            {/* Demo Badge */}
            {profile.isDemo && (
              <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-md text-[10px] font-semibold text-amber-300 px-2.5 py-1 rounded border border-amber-500/30">
                DEMO DATA
              </div>
            )}

            {/* 18+ Verification Tag */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              {profile.isPremium && (
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 backdrop-blur-md border border-amber-500/40">
                  <Crown className="w-4 h-4 fill-amber-300" />
                </span>
              )}
              {profile.isVerified && (
                <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 backdrop-blur-md border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>18+ Verified Adult</span>
                </span>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-stone-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="text-xl font-bold text-rose-400">
                    {profile.age}
                  </span>
                </div>

                {/* Clean unboxed metadata with separators */}
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-stone-300">{profile.city}</span>
                  <span aria-hidden="true">·</span>
                  <span>{profile.gender || 'Adult'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-medium">{profile.lastActive || 'Active'}</span>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  About Me
                </h3>
                <p className="text-sm text-stone-300 dark:text-stone-300 light:text-stone-700 leading-relaxed bg-stone-950/40 dark:bg-stone-950/40 light:bg-stone-50 p-4 rounded-2xl border border-stone-800/80 dark:border-stone-800/80 light:border-stone-200">
                  {profile.bio}
                </p>
              </div>

              {/* Interests (interactive clean chips) */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Passions & Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded-lg"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-[11px] text-stone-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Private Information Shielded:</strong> Phone numbers, email addresses, and exact residential addresses are strictly protected under LocalConnect Privacy Standards.
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-stone-800 dark:border-stone-800 light:border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onMessage(profile)}
                  className="flex-1 py-3 px-5 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Message</span>
                </button>

                {onLike && (
                  <button
                    onClick={() => onLike(profile)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isLiked
                        ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                        : 'border-stone-800 text-stone-400 hover:text-rose-400 hover:border-stone-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
                  </button>
                )}
              </div>

              {/* Safety Actions: Block and Report */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => onBlock(profile)}
                  className="text-stone-400 hover:text-stone-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-stone-500" />
                  <span>Block User</span>
                </button>

                <button
                  onClick={() => onReport(profile)}
                  className="text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Report Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
