import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.ts';

interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  adminLogin: (email: string, pass: string) => Promise<void>;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem('localconnect_admin_token')
  );
  const [adminEmail, setAdminEmail] = useState<string | null>(() =>
    localStorage.getItem('localconnect_admin_email')
  );

  const adminLogin = async (email: string, pass: string) => {
    const res = await api.adminLogin({ email, password: pass });
    localStorage.setItem('localconnect_admin_token', res.token);
    localStorage.setItem('localconnect_admin_email', res.adminEmail);
    setAdminToken(res.token);
    setAdminEmail(res.adminEmail);
  };

  const adminLogout = () => {
    localStorage.removeItem('localconnect_admin_token');
    localStorage.removeItem('localconnect_admin_email');
    setAdminToken(null);
    setAdminEmail(null);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminLoggedIn: Boolean(adminToken),
        adminEmail,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
