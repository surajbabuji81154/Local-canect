import React from 'react';
import { Heart, MessageSquare, Compass, Crown, Shield, Sun, Moon, LogIn, User as UserIcon, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openAdmin: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openAdmin,
  unreadCount = 0
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/80 light:border-stone-200 light:bg-white/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white dark:text-white light:text-stone-900">
                  Local<span className="text-rose-500">Connect</span>
                </span>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded tracking-wider">
                  18+
                </span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-400 light:text-stone-500 leading-none hidden sm:block">
                Adult Local Dating & Chat
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 text-sm font-medium transition cursor-pointer ${
                currentTab === 'home'
                  ? 'text-rose-500 border-b-2 border-rose-500 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 dark:hover:text-white light:text-stone-600 light:hover:text-stone-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('discover')}
              className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'discover'
                  ? 'text-rose-500 border-b-2 border-rose-500 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 dark:hover:text-white light:text-stone-600 light:hover:text-stone-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>
            <button
              onClick={() => setCurrentTab('connections')}
              className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'connections'
                  ? 'text-rose-500 border-b-2 border-rose-500 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 dark:hover:text-white light:text-stone-600 light:hover:text-stone-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Connections</span>
            </button>
            <button
              onClick={() => setCurrentTab('messages')}
              className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 relative cursor-pointer ${
                currentTab === 'messages'
                  ? 'text-rose-500 border-b-2 border-rose-500 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 dark:hover:text-white light:text-stone-600 light:hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setCurrentTab('premium')}
              className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'premium'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-stone-400 hover:text-stone-200 dark:hover:text-white light:text-stone-600 light:hover:text-stone-900 rounded-lg hover:bg-stone-900 dark:hover:bg-stone-900 light:hover:bg-stone-100 transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin link */}
          <button
            onClick={openAdmin}
            title="Admin Portal"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-400 hover:text-stone-200 dark:hover:text-white rounded-lg hover:bg-stone-900 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('profile')}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-900 dark:hover:bg-stone-900 light:hover:bg-stone-100 transition cursor-pointer text-left"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-rose-500/40"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white dark:text-white light:text-stone-900 flex items-center gap-1">
                    <span>{user.name.split(' ')[0]}</span>
                    {user.isPremium && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  </div>
                  <div className="text-[10px] text-stone-400">{user.city}</div>
                </div>
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-900 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-lg shadow-sm shadow-rose-600/30 transition cursor-pointer"
              >
                Join Now
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
