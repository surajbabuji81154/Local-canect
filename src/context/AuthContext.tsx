import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  isAdultConfirmed: boolean;
  confirmAdultAge: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('localconnect_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdultConfirmed, setIsAdultConfirmed] = useState<boolean>(() => {
    return localStorage.getItem('localconnect_adult_confirmed') === 'true';
  });

  const confirmAdultAge = () => {
    localStorage.setItem('localconnect_adult_confirmed', 'true');
    setIsAdultConfirmed(true);
  };

  const refreshUser = async () => {
    if (!localStorage.getItem('localconnect_token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('localconnect_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('localconnect_token', res.token);
    setToken(res.token);
    setUser(res.user);
    confirmAdultAge();
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    localStorage.setItem('localconnect_token', res.token);
    setToken(res.token);
    setUser(res.user);
    confirmAdultAge();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('localconnect_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateMyProfile(data);
    setUser(res.user);
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    localStorage.removeItem('localconnect_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        isAdultConfirmed,
        confirmAdultAge,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
