import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, MapPin, Calendar, Heart, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { CityItem } from '../types/index.ts';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cities from API
  const [cities, setCities] = useState<string[]>([
    'Delhi', 'Mumbai', 'Lucknow', 'Kanpur', 'Jaipur', 'Bengaluru', 'Hyderabad'
  ]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number | ''>(24);
  const [city, setCity] = useState('Delhi');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [gender, setGender] = useState('Female');
  const [lookingFor, setLookingFor] = useState('Men');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coffee', 'Travel']);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await api.getCities();
        if (res.cities && res.cities.length > 0) {
          setCities(res.cities.filter(c => c.active).map(c => c.name));
        }
      } catch (e) {
        // fallback to default cities
      }
    }
    loadCities();
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        // Registration validations
        if (!isAgeConfirmed) {
          throw new Error('You must confirm you are at least 18 years of age.');
        }

        const numericAge = Number(age);
        if (isNaN(numericAge) || numericAge < 18) {
          throw new Error('You must be 18 years or older to register on LocalConnect.');
        }

        if (!name.trim()) throw new Error('Please enter your display name.');
        if (!email.trim()) throw new Error('Please enter your email address.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (selectedInterests.length === 0) throw new Error('Please select at least 1 interest.');

        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          age: numericAge,
          city,
          avatar,
          bio: bio.trim() || 'Excited to discover new people and have meaningful conversations.',
          interests: selectedInterests,
          gender,
          lookingFor,
          isAgeConfirmed: true
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl mb-6 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'register'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Create 18+ Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'login'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'register' ? 'Join LocalConnect' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            {mode === 'register'
              ? 'Meet verified adults in your city · Strictly 18+'
              : 'Sign in to access your connections and chats'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* Display Name & Age */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samaira or Rahul"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Age (18+)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    required
                    value={age}
                    onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 text-center font-bold focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              {/* City & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Your City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-500 pointer-events-none" />
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-rose-500 transition appearance-none cursor-pointer"
                    >
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Looking For
                  </label>
                  <select
                    value={lookingFor}
                    onChange={e => setLookingFor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-rose-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Everyone">Everyone</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
              </div>

              {/* Profile Photo Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Select Profile Photo
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {AVATAR_OPTIONS.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(imgUrl)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        avatar === imgUrl ? 'border-rose-500 scale-105' : 'border-stone-800 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={imgUrl} alt="Avatar option" className="w-full h-full object-cover" />
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
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  maxLength={160}
                  placeholder="Tell others what you enjoy, your hobbies, or what brings you here..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-rose-500 transition resize-none"
                />
              </div>

              {/* Interests (interactive buttons) */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Interests (Pick up to 5)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {DEFAULT_INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer border ${
                          isSelected
                            ? 'bg-rose-600 border-rose-500 text-white font-medium'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Your email is kept private and never shown to other users.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          </div>

          {/* Mandatory 18+ Checkbox */}
          {mode === 'register' && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isAgeConfirmed}
                  onChange={e => setIsAgeConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0 cursor-pointer rounded"
                />
                <div className="text-xs text-stone-300 leading-snug">
                  <strong className="text-white font-semibold">
                    “I confirm that I am 18 years old or older.”
                  </strong>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Underage users (under 18) are prohibited from accessing or registering.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            {loading
              ? 'Processing...'
              : mode === 'register'
              ? 'Complete 18+ Registration'
              : 'Sign In to Account'}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 text-center text-xs text-stone-400">
          {mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-rose-400 hover:underline font-medium cursor-pointer"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              New to LocalConnect?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-rose-400 hover:underline font-medium cursor-pointer"
              >
                Register free
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
