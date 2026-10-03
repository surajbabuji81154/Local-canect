import React from 'react';
import { Heart, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
import type { SafeUser } from '../types/index.ts';
import { ProfileCard } from '../components/ProfileCard.tsx';

interface ConnectionsPageProps {
  likedProfiles: SafeUser[];
  onViewProfile: (profile: SafeUser) => void;
  onMessage: (profile: SafeUser) => void;
  onExplore: () => void;
}

export const ConnectionsPage: React.FC<ConnectionsPageProps> = ({
  likedProfiles,
  onViewProfile,
  onMessage,
  onExplore
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-stone-900 flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-current" />
            <span>Your Matches & Connections</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Singles you've expressed interest in · Connect and chat anytime
          </p>
        </div>

        <button
          onClick={onExplore}
          className="px-4 py-2 bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
        >
          <Compass className="w-4 h-4 text-rose-500" />
          <span>Discover More Singles</span>
        </button>
      </div>

      {likedProfiles.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-stone-900/40 rounded-3xl border border-stone-800 p-8 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Matches Yet</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            When you like profiles in the Discover feed, they will appear here so you can easily reach out and start a chat.
          </p>
          <button
            onClick={onExplore}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-rose-600/30"
          >
            Start Exploring Profiles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {likedProfiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onViewProfile={onViewProfile}
              onMessage={onMessage}
              isLiked={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
