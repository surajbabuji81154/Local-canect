import React from 'react';
import { MapPin, CheckCircle2, MessageSquare, Heart, Shield, Crown } from 'lucide-react';
import type { SafeUser } from '../types/index.ts';

interface ProfileCardProps {
  profile: SafeUser;
  onViewProfile: (profile: SafeUser) => void;
  onMessage: (profile: SafeUser) => void;
  onLike?: (profile: SafeUser) => void;
  isLiked?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onViewProfile,
  onMessage,
  onLike,
  isLiked = false
}) => {
  return (
    <div className="group relative bg-stone-900/90 dark:bg-stone-900/90 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200 rounded-2xl overflow-hidden hover:border-stone-700 transition duration-300 flex flex-col shadow-lg shadow-black/20">
      {/* Photo Container */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-stone-950">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-90" />

        {/* Demo Data Indicator */}
        {profile.isDemo && (
          <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-300 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border border-amber-500/30">
            DEMO DATA
          </div>
        )}

        {/* Premium / Verified Adult Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {profile.isPremium && (
            <span
              title="Premium Member"
              className="p-1 rounded-md bg-amber-500/20 text-amber-300 backdrop-blur-md border border-amber-500/40"
            >
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
            </span>
          )}
          {profile.isVerified && (
            <span
              title="Verified 18+ Adult Profile"
              className="p-1 rounded-md bg-rose-500/20 text-rose-300 backdrop-blur-md border border-rose-500/40 flex items-center gap-1 text-[10px] font-medium px-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-rose-400" />
              <span>18+ Verified</span>
            </span>
          )}
        </div>

        {/* Bottom Details Overlay on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-bold tracking-tight text-white drop-shadow-sm truncate">
              {profile.name}
            </h3>
            <span className="text-base font-semibold text-rose-300">
              {profile.age}
            </span>
          </div>

          {/* Clean unboxed metadata with typographic separator */}
          <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{profile.city}</span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="text-stone-400">{profile.lastActive || 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Short Bio */}
        <p className="text-xs text-stone-300 dark:text-stone-300 light:text-stone-600 line-clamp-2 leading-relaxed">
          {profile.bio}
        </p>

        {/* Clean unboxed interests with separators */}
        <div className="text-[11px] text-stone-400 dark:text-stone-400 light:text-stone-500 line-clamp-1">
          <span className="text-stone-500 mr-1">Interests:</span>
          {profile.interests.map((interest, idx) => (
            <React.Fragment key={interest}>
              <span className="text-stone-300 dark:text-stone-200 light:text-stone-700">{interest}</span>
              {idx < profile.interests.length - 1 && (
                <span className="mx-1 text-stone-600">/</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-stone-800 dark:border-stone-800 light:border-stone-200 flex items-center gap-2">
          <button
            onClick={() => onViewProfile(profile)}
            className="flex-1 py-2 px-3 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 rounded-xl transition text-center cursor-pointer"
          >
            View Profile
          </button>

          <button
            onClick={() => onMessage(profile)}
            className="flex-1 py-2 px-3 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message</span>
          </button>

          {onLike && (
            <button
              onClick={() => onLike(profile)}
              title={isLiked ? 'Liked' : 'Like Profile'}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isLiked
                  ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                  : 'border-stone-800 hover:border-stone-700 text-stone-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
