import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AdminProvider } from './context/AdminContext.tsx';

import { Navbar } from './components/Navbar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { Footer } from './components/Footer.tsx';
import { AgeGateModal } from './components/AgeGateModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { BlockModal } from './components/BlockModal.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { TelegramCommunityModal } from './components/TelegramCommunityModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { DiscoverPage } from './pages/DiscoverPage.tsx';
import { ProfileDetailPage } from './pages/ProfileDetailPage.tsx';
import { MessagesPage } from './pages/MessagesPage.tsx';
import { ConnectionsPage } from './pages/ConnectionsPage.tsx';
import { PremiumPage } from './pages/PremiumPage.tsx';
import { MyProfilePage } from './pages/MyProfilePage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { StaticPages } from './pages/StaticPages.tsx';

import { api } from './services/api.ts';
import type { SafeUser, CityItem, Plan } from './types/index.ts';

function MainApp() {
  const { user } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [viewingProfile, setViewingProfile] = useState<SafeUser | null>(null);

  // Global Data
  const [cities, setCities] = useState<CityItem[]>([]);
  const [featuredProfiles, setFeaturedProfiles] = useState<SafeUser[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('localconnect_liked_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [likedProfiles, setLikedProfiles] = useState<SafeUser[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Messaging active chat target
  const [chatRecipient, setChatRecipient] = useState<SafeUser | null>(null);

  // Modals
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'register'
  });
  const [reportingUser, setReportingUser] = useState<SafeUser | null>(null);
  const [blockingUser, setBlockingUser] = useState<SafeUser | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);

  // Load cities and initial featured profiles
  useEffect(() => {
    async function initData() {
      try {
        const [citiesRes, profilesRes] = await Promise.all([
          api.getCities(),
          api.getProfiles({ limit: 8 } as any)
        ]);
        setCities(citiesRes.cities);
        setFeaturedProfiles(profilesRes.profiles);

        // Filter liked profiles
        const liked = profilesRes.profiles.filter(p => likedUserIds.includes(p.id));
        setLikedProfiles(liked);
      } catch (err) {
        console.error('Error initializing data:', err);
      }
    }
    initData();
  }, []);

  // Check unread count
  useEffect(() => {
    async function checkUnread() {
      if (!user) return;
      try {
        const res = await api.getConversations();
        const totalUnread = res.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch {
        // ignore
      }
    }
    checkUnread();
    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Likes
  const handleLikeProfile = (profile: SafeUser) => {
    let updated: string[];
    if (likedUserIds.includes(profile.id)) {
      updated = likedUserIds.filter(id => id !== profile.id);
      setLikedProfiles(prev => prev.filter(p => p.id !== profile.id));
    } else {
      updated = [...likedUserIds, profile.id];
      setLikedProfiles(prev => [...prev, profile]);
    }
    setLikedUserIds(updated);
    localStorage.setItem('localconnect_liked_users', JSON.stringify(updated));
  };

  // Profile Actions
  const handleViewProfile = (profile: SafeUser) => {
    setViewingProfile(profile);
    setCurrentTab('profile_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMessageProfile = (profile: SafeUser) => {
    if (!user) {
      setAuthModal({ open: true, mode: 'login' });
      return;
    }
    setChatRecipient(profile);
    setCurrentTab('messages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreWithCity = (city?: string) => {
    if (city) setSelectedCityFilter(city);
    setCurrentTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModal({ open: true, mode });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 dark:bg-stone-950 light:bg-stone-50 text-stone-100 dark:text-stone-100 light:text-stone-900 transition-colors">
      {/* 18+ Mandatory Age Gate */}
      <AgeGateModal />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setViewingProfile(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={openAuth}
        openAdmin={() => {
          setCurrentTab('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Home */}
        {currentTab === 'home' && (
          <HomePage
            onJoinNow={() => openAuth('register')}
            onExploreProfiles={handleExploreWithCity}
            featuredProfiles={featuredProfiles}
            cities={cities}
            onOpenTelegram={() => setShowTelegramModal(true)}
            onViewProfile={handleViewProfile}
          />
        )}

        {/* Discover */}
        {currentTab === 'discover' && (
          <DiscoverPage
            initialCity={selectedCityFilter}
            onViewProfile={handleViewProfile}
            onMessage={handleMessageProfile}
            onLikeProfile={handleLikeProfile}
            likedUserIds={likedUserIds}
          />
        )}

        {/* Detailed Profile View */}
        {currentTab === 'profile_detail' && viewingProfile && (
          <ProfileDetailPage
            profile={viewingProfile}
            onBack={() => setCurrentTab('discover')}
            onMessage={handleMessageProfile}
            onBlock={(p) => setBlockingUser(p)}
            onReport={(p) => setReportingUser(p)}
            onLike={handleLikeProfile}
            isLiked={likedUserIds.includes(viewingProfile.id)}
          />
        )}

        {/* Messages */}
        {currentTab === 'messages' && (
          user ? (
            <MessagesPage
              initialRecipient={chatRecipient || undefined}
              onOpenReport={(p) => setReportingUser(p)}
              onOpenBlock={(p) => setBlockingUser(p)}
              onExplore={() => setCurrentTab('discover')}
            />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
              <h2 className="text-xl font-bold text-white">Sign In to Chat</h2>
              <p className="text-xs text-stone-400">
                You must be a registered, verified adult member to send and receive real-time messages.
              </p>
              <button
                onClick={() => openAuth('login')}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl"
              >
                Sign In Now
              </button>
            </div>
          )
        )}

        {/* Connections */}
        {currentTab === 'connections' && (
          <ConnectionsPage
            likedProfiles={likedProfiles}
            onViewProfile={handleViewProfile}
            onMessage={handleMessageProfile}
            onExplore={() => setCurrentTab('discover')}
          />
        )}

        {/* Premium */}
        {currentTab === 'premium' && (
          <PremiumPage
            onSelectPlan={(plan) => setSelectedPlanForPayment(plan)}
            onOpenTelegram={() => setShowTelegramModal(true)}
            openAuthModal={openAuth}
          />
        )}

        {/* My Profile */}
        {currentTab === 'profile' && (
          <MyProfilePage
            cities={cities}
            onOpenPremium={() => setCurrentTab('premium')}
            onOpenTelegram={() => setShowTelegramModal(true)}
          />
        )}

        {/* Admin Dashboard */}
        {currentTab === 'admin' && (
          <AdminDashboardPage onExit={() => setCurrentTab('home')} />
        )}

        {/* Static SEO Pages */}
        {['about', 'terms', 'privacy', 'community-guidelines', 'contact'].includes(currentTab) && (
          <StaticPages
            type={currentTab as any}
            onBack={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* Footer */}
      {currentTab !== 'messages' && currentTab !== 'admin' && (
        <Footer
          onNavigate={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          openAdmin={() => {
            setCurrentTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenTelegram={() => setShowTelegramModal(true)}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setViewingProfile(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={openAuth}
        unreadCount={unreadCount}
      />

      {/* Modals */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'register' })}
        />
      )}

      {reportingUser && (
        <ReportModal
          user={reportingUser}
          onClose={() => setReportingUser(null)}
        />
      )}

      {blockingUser && (
        <BlockModal
          user={blockingUser}
          onClose={() => setBlockingUser(null)}
          onBlocked={() => {
            if (viewingProfile?.id === blockingUser.id) {
              setViewingProfile(null);
              setCurrentTab('discover');
            }
          }}
        />
      )}

      {selectedPlanForPayment && (
        <PaymentModal
          plan={selectedPlanForPayment}
          onClose={() => setSelectedPlanForPayment(null)}
          onSuccess={() => {
            // Success handler
          }}
        />
      )}

      {showTelegramModal && (
        <TelegramCommunityModal
          onClose={() => setShowTelegramModal(false)}
          onOpenPremium={() => {
            setShowTelegramModal(false);
            setCurrentTab('premium');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <MainApp />
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
