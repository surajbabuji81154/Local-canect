import React from 'react';
import { Home, Compass, Heart, MessageSquare, Crown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  unreadCount = 0
}) => {
  const { user } = useAuth();

  const handleProfileClick = () => {
    if (user) {
      setCurrentTab('profile');
    } else {
      openAuthModal('login');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'connections', label: 'Matches', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 },
    { id: 'premium', label: 'Premium', icon: Crown, color: 'text-amber-400' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 dark:bg-stone-950/95 light:bg-white/95 backdrop-blur-lg border-t border-stone-800 dark:border-stone-800 light:border-stone-200 pb-safe">
      <div className="grid grid-cols-6 h-16 items-center px-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition cursor-pointer relative ${
                isActive
                  ? 'text-rose-500 font-semibold'
                  : item.color || 'text-stone-400 hover:text-stone-200 dark:hover:text-white light:text-stone-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-stone-950" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* Profile / Auth Tab */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition cursor-pointer ${
            currentTab === 'profile'
              ? 'text-rose-500 font-semibold'
              : 'text-stone-400 hover:text-stone-200 dark:hover:text-white light:text-stone-600'
          }`}
        >
          {user ? (
            <img
              src={user.avatar}
              alt={user.name}
              className={`w-5 h-5 rounded-full object-cover border ${
                currentTab === 'profile' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-700'
              }`}
            />
          ) : (
            <UserIcon className="w-5 h-5 stroke-[1.8]" />
          )}
          <span className="text-[10px] mt-1 tracking-tight leading-none">{user ? 'You' : 'Login'}</span>
        </button>
      </div>
    </nav>
  );
};
