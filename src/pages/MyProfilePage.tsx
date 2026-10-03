import React, { useState } from 'react';
import { User, MapPin, CheckCircle2, Crown, Shield, Trash2, Save, Send, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { CityItem } from '../types/index.ts';

interface MyProfilePageProps {
  cities: CityItem[];
  onOpenPremium: () => void;
  onOpenTelegram: () => void;
}

const DEFAULT_INTERESTS = [
  'Coffee', 'Travel', 'Architecture', 'Foodie', 'Music', 'Fitness', 'Art', 'Movies',
  'Books', 'Tech', 'Photography', 'Outdoors', 'Cooking', 'Dancing'
];

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
];

export const MyProfilePage: React.FC<MyProfilePageProps> = ({
  cities,
  onOpenPremium,
  onOpenTelegram
}) => {
  const { user, updateProfile, deleteAccount, logout } = useAuth();

  if (!user) return null;

  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [lookingFor, setLookingFor] = useState(user.lookingFor || 'Everyone');
  const [gender, setGender] = useState(user.gender || 'Not Specified');
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      if (interests.length < 6) {
        setInterests([...interests, interest]);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        name,
        city,
        bio,
        avatar,
        lookingFor,
        gender,
        interests
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to permanently delete your LocalConnect account? All your chats, matches, and profile data will be erased.'
    );
    if (!confirmation) return;

    try {
      await deleteAccount();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <img
              src={avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-rose-500 shadow-lg"
            />
            {user.isPremium && (
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-stone-950">
                <Crown className="w-4 h-4 fill-current" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="text-sm font-semibold text-rose-400">{user.age}</span>
            </div>
            <div className="text-xs text-stone-400 flex items-center gap-2 justify-center sm:justify-start mt-0.5">
              <span>{user.city}</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">18+ Verified Account</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {user.isPremium ? (
            <button
              onClick={onOpenTelegram}
              className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Telegram VIP</span>
            </button>
          ) : (
            <button
              onClick={onOpenPremium}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-rose-600/30"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>Upgrade to Premium</span>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full sm:w-auto px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <h3 className="text-lg font-bold text-white">Edit Your Profile</h3>
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Changes Saved</span>
            </span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Age (Readonly for strict 18+ enforcement) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Verified Age
              </label>
              <span className="text-[10px] text-emerald-400 font-medium">18+ Confirmed</span>
            </div>
            <input
              type="text"
              disabled
              value={`${user.age} years old (Verified)`}
              className="w-full px-3.5 py-2.5 bg-stone-950/60 border border-stone-800/80 rounded-xl text-xs text-stone-400 cursor-not-allowed"
            />
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
              Current City
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {cities.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Looking For */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
              Looking For
            </label>
            <select
              value={lookingFor}
              onChange={e => setLookingFor(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="Everyone">Everyone</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
          </div>
        </div>

        {/* Change Photo */}
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Change Profile Photo
          </label>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {AVATAR_OPTIONS.map((imgUrl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatar(imgUrl)}
                className={`relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                  avatar === imgUrl ? 'border-rose-500 scale-105 shadow-md' : 'border-stone-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="Avatar" className="w-full h-full object-cover" />
                {avatar === imgUrl && (
                  <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center text-white">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
            About You (Bio)
          </label>
          <textarea
            rows={3}
            maxLength={250}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition resize-none"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Interests & Passions
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_INTERESTS.map(interest => {
              const isSelected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-stone-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Account Deletion / Data Privacy */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Permanently Delete Account</h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Erase all personal data, conversations, matches, and images from our servers.
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-stone-950 hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete My Account</span>
        </button>
      </div>
    </div>
  );
};
