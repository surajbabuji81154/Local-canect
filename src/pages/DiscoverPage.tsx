import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, RefreshCw, X, SlidersHorizontal, Heart, Shield } from 'lucide-react';
import { ProfileCard } from '../components/ProfileCard.tsx';
import { api } from '../services/api.ts';
import type { SafeUser, CityItem } from '../types/index.ts';

interface DiscoverPageProps {
  initialCity?: string;
  onViewProfile: (profile: SafeUser) => void;
  onMessage: (profile: SafeUser) => void;
  onLikeProfile: (profile: SafeUser) => void;
  likedUserIds: string[];
}

const INTEREST_FILTERS = [
  'All', 'Coffee', 'Travel', 'Architecture', 'Foodie', 'Music', 'Fitness', 'Art', 'Tech', 'Photography', 'Outdoors'
];

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  initialCity = 'All',
  onViewProfile,
  onMessage,
  onLikeProfile,
  likedUserIds
}) => {
  const [profiles, setProfiles] = useState<SafeUser[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(50);
  const [selectedInterest, setSelectedInterest] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await api.getCities();
        setCities(res.cities);
      } catch (e) {
        // fallback
      }
    }
    loadCities();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProfiles({
        city: selectedCity,
        minAge,
        maxAge,
        interest: selectedInterest,
        search: searchQuery
      });
      setProfiles(res.profiles);
    } catch (err: any) {
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [selectedCity, minAge, maxAge, selectedInterest]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfiles();
  };

  const resetFilters = () => {
    setSelectedCity('All');
    setMinAge(18);
    setMaxAge(50);
    setSelectedInterest('All');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-stone-900">
            Discover Adult Singles
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Verified adults near you · Filter by city, age, and lifestyle interests
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-stone-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, vibe, or hobby..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-stone-900/90 dark:bg-stone-900/90 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200 rounded-xl text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-rose-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchProfiles();
              }}
              className="absolute right-3 text-stone-500 hover:text-stone-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Filter Bar */}
      <div className="bg-stone-900/70 dark:bg-stone-900/70 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200 rounded-2xl p-4 space-y-4">
        {/* Quick City Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Filter by City</span>
            </span>
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden text-xs text-rose-400 font-medium flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFiltersMobile ? 'Hide Filters' : 'More Filters'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCity('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCity === 'All'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-950'
              }`}
            >
              All Cities
            </button>
            {cities.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCity.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-950'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Extended Filters (Desktop always, Mobile toggle) */}
        <div className={`space-y-4 pt-3 border-t border-stone-800/80 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Age Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1.5">
                <span className="font-semibold text-stone-400 text-[11px] uppercase tracking-wider">
                  Age Range (Strictly 18+)
                </span>
                <span className="font-mono text-rose-400 font-semibold">{minAge} — {maxAge} yrs</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={minAge}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (val <= maxAge) setMinAge(val);
                  }}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={maxAge}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (val >= minAge) setMaxAge(val);
                  }}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Interest filter */}
            <div className="md:col-span-2">
              <span className="block font-semibold text-stone-400 text-[11px] uppercase tracking-wider mb-1.5">
                Filter by Interest
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_FILTERS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterest(interest)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedInterest === interest
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-950/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filter Tags & Reset */}
          <div className="flex items-center justify-between pt-2 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span>Showing:</span>
              <strong className="text-white">{profiles.length} profiles</strong>
              {selectedCity !== 'All' && <span>in <span className="text-rose-400 font-medium">{selectedCity}</span></span>}
            </div>

            {(selectedCity !== 'All' || minAge !== 18 || maxAge !== 50 || selectedInterest !== 'All' || searchQuery) && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500" />
          <p className="text-xs text-stone-400">Finding verified singles in your city...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <p className="text-xs text-rose-300">{error}</p>
          <button
            onClick={fetchProfiles}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
          >
            Try Again
          </button>
        </div>
      ) : profiles.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-stone-900/40 rounded-3xl border border-stone-800 p-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-800 text-stone-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Profiles Found Matching Criteria</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try broadening your age range or selecting "All Cities" to discover more verified adult singles.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onViewProfile={onViewProfile}
              onMessage={onMessage}
              onLike={onLikeProfile}
              isLiked={likedUserIds.includes(profile.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
