import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  Crown,
  DollarSign,
  Send,
  MapPin,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  LogOut,
  Save,
  Lock,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext.tsx';
import { api } from '../services/api.ts';
import type { AdminStats, User, Report, Plan, PaymentRecord, CityItem } from '../types/index.ts';

export const AdminDashboardPage: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { isAdminLoggedIn, adminEmail, adminLogin, adminLogout } = useAdmin();

  // Login form state
  const [emailInput, setEmailInput] = useState('admin@localconnect.app');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'reports' | 'pricing' | 'telegram' | 'cities' | 'payments'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [settings, setSettings] = useState<{ telegramInviteLink: string; razorpayKeyId: string; adminEmail: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New city form
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('');

  // Edit price modal / inline
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editedPrice, setEditedPrice] = useState<number>(0);

  // Telegram link editor
  const [newTelegramLink, setNewTelegramLink] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await adminLogin(emailInput, passInput);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, rRes, pRes, payRes, setRes, cRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getAdminPlans(),
        api.getAdminPayments(),
        api.getAdminSettings(),
        api.getCities()
      ]);

      setStats(sRes.stats);
      setUsers(uRes.users);
      setReports(rRes.reports);
      setPlans(pRes.plans);
      setPayments(payRes.payments);
      setSettings(setRes);
      setNewTelegramLink(setRes.telegramInviteLink);
      setCities(cRes.cities);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAllAdminData();
    }
  }, [isAdminLoggedIn]);

  const showFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await api.adminUserAction(userId, action);
      showFeedback(`User status updated (${action})`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      await api.adminReportAction(reportId, action);
      showFeedback(`Report ${action}d`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleSavePlanPrice = async (planId: string) => {
    try {
      await api.updateAdminPlan(planId, { price: editedPrice });
      setEditingPlan(null);
      showFeedback('Subscription plan price updated successfully');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    }
  };

  const handleSaveTelegram = async () => {
    try {
      await api.updateAdminSettings({ telegramInviteLink: newTelegramLink });
      showFeedback('Telegram community invite link updated');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    try {
      await api.addAdminCity({ name: newCityName, state: newCityState });
      setNewCityName('');
      setNewCityState('');
      showFeedback('New city added to platform');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to add city');
    }
  };

  const handleToggleCityActive = async (cityId: string, currentActive: boolean) => {
    try {
      await api.updateAdminCity(cityId, { active: !currentActive });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update city');
    }
  };

  // Login Screen if not authenticated
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl text-stone-100">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-1">
            Admin Moderation Portal
          </h2>
          <p className="text-xs text-stone-400 text-center mb-6">
            Authorized administrators only · Manage users, safety reports, and billing
          </p>

          {loginError && (
            <div className="p-3 mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password..."
                value={passInput}
                onChange={e => setPassInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Default in seed: <code className="text-stone-400 font-mono">AdminLocalConnect2026!</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              {loginLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onExit}
              className="text-xs text-stone-400 hover:text-white"
            >
              ← Return to LocalConnect Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/20 text-rose-400 text-xs font-mono font-bold">
              ADMIN CONSOLE
            </span>
            <span className="text-xs text-stone-400">{adminEmail}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            LocalConnect Management Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            title="Refresh Data"
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={adminLogout}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition"
          >
            View Site
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-800 text-xs">
        {[
          { id: 'stats', label: 'Platform Stats', icon: Users },
          { id: 'users', label: 'User Moderation', icon: Users, badge: users.length },
          { id: 'reports', label: 'Safety Reports', icon: AlertTriangle, badge: stats?.pendingReports },
          { id: 'pricing', label: 'Premium Plans & Prices', icon: DollarSign },
          { id: 'payments', label: 'Payment Logs', icon: DollarSign, badge: payments.length },
          { id: 'telegram', label: 'Telegram VIP Settings', icon: Send },
          { id: 'cities', label: 'Manage Cities', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-rose-500 text-rose-400 bg-stone-900/50 rounded-t-xl'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Stats */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Total Users</span>
              <div className="text-2xl font-extrabold text-white">{stats.totalUsers}</div>
              <span className="text-[10px] text-stone-500">{stats.demoProfilesCount} Demo Profiles</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Active Users</span>
              <div className="text-2xl font-extrabold text-emerald-400">{stats.activeUsers}</div>
              <span className="text-[10px] text-stone-500">Allowed on platform</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Premium VIPs</span>
              <div className="text-2xl font-extrabold text-amber-400">{stats.premiumUsers}</div>
              <span className="text-[10px] text-stone-500">Paid Subscribers</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Messages Sent</span>
              <div className="text-2xl font-extrabold text-sky-400">{stats.totalMessages}</div>
              <span className="text-[10px] text-stone-500">All chat threads</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Total Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-300">₹{stats.totalRevenue}</div>
              <span className="text-[10px] text-stone-500">Verified Razorpay</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Pending Reports</span>
              <div className="text-2xl font-extrabold text-rose-500">{stats.pendingReports}</div>
              <span className="text-[10px] text-stone-500">Requires triage</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
            <h3 className="font-bold text-base text-white">System Architecture & Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300">
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                <span className="text-stone-500 block mb-1">Razorpay Integration</span>
                <span className="font-semibold text-emerald-400">
                  {settings?.razorpayKeyId && !settings.razorpayKeyId.includes('YourKeyId') ? 'Active (Live)' : 'Configured (Sandbox HMAC)'}
                </span>
              </div>
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                <span className="text-stone-500 block mb-1">Adult Age Gate</span>
                <span className="font-semibold text-emerald-400">Strict Enforcement (18+ Only)</span>
              </div>
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                <span className="text-stone-500 block mb-1">Database Engine</span>
                <span className="font-semibold text-stone-200">LocalConnect Persistent JSON DB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Moderation */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">User Accounts ({users.length})</h3>
              <span className="text-xs text-stone-400">Moderation tools & verification badges</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Age</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">18+ Verified</th>
                    <th className="p-3.5">VIP Plan</th>
                    <th className="p-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-stone-800/40">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isDemo && (
                                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-mono">
                                  DEMO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-rose-400">{u.age}</td>
                      <td className="p-3.5 text-stone-300">{u.city}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleUserAction(u.id, 'verify_toggle')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer border ${
                            u.isVerified
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-stone-800 text-stone-400 border-stone-700'
                          }`}
                        >
                          {u.isVerified ? '✓ 18+ Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleUserAction(u.id, u.isPremium ? 'revoke_premium' : 'grant_premium')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer border ${
                            u.isPremium
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-stone-800 text-stone-400 border-stone-700'
                          }`}
                        >
                          {u.isPremium ? '★ VIP Premium' : 'Standard'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {u.status === 'active' ? (
                          <button
                            onClick={() => handleUserAction(u.id, 'suspend')}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg text-[11px] font-medium transition cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(u.id, 'activate')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-medium transition cursor-pointer"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete user ${u.name}?`)) {
                              handleUserAction(u.id, 'delete');
                            }
                          }}
                          className="px-2 py-1 bg-stone-800 hover:bg-rose-900/50 text-rose-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Safety Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">Community Safety Reports ({reports.length})</h3>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400">
                No safety complaints or reports currently filed.
              </div>
            ) : (
              <div className="divide-y divide-stone-800 text-xs">
                {reports.map(rep => (
                  <div key={rep.id} className="p-4 space-y-2 hover:bg-stone-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-400">{rep.reason}</span>
                        <span className="text-[10px] text-stone-500">
                          {new Date(rep.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rep.status === 'pending'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-stone-300">
                      Reported User: <strong className="text-white">{rep.reportedUserName}</strong> ({rep.reportedUserId})
                      <br />
                      Reporter: <span className="text-stone-400">{rep.reporterName || 'Anonymous User'}</span>
                    </div>

                    {rep.details && (
                      <p className="p-2.5 bg-stone-950 rounded-xl text-stone-400 text-xs border border-stone-800">
                        {rep.details}
                      </p>
                    )}

                    {rep.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleReportAction(rep.id, 'resolve')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => handleReportAction(rep.id, 'dismiss')}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleUserAction(rep.reportedUserId, 'suspend')}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Suspend Reported User
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Pricing Management */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Subscription Pricing Editor</h3>
              <p className="text-xs text-stone-400">
                Edit prices live for 1 Day, 7 Days, and 30 Days plans. Changes take effect immediately on frontend and payment orders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map(p => (
                <div key={p.id} className="p-5 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{p.name}</span>
                    <span className="text-xs text-stone-400">{p.durationLabel}</span>
                  </div>

                  <div className="text-3xl font-extrabold text-amber-400">
                    ₹{p.price}
                  </div>

                  {editingPlan?.id === p.id ? (
                    <div className="space-y-2 pt-2 border-t border-stone-800">
                      <label className="text-[10px] text-stone-400 uppercase font-semibold">New Price (INR)</label>
                      <input
                        type="number"
                        min="1"
                        value={editedPrice}
                        onChange={e => setEditedPrice(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSavePlanPrice(p.id)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                        >
                          Save Price
                        </button>
                        <button
                          onClick={() => setEditingPlan(null)}
                          className="px-3 py-1.5 bg-stone-800 text-stone-400 text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPlan(p);
                        setEditedPrice(p.price);
                      }}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-stone-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Price</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Payment Logs */}
      {activeTab === 'payments' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-stone-800">
            <h3 className="text-sm font-bold text-white">Payment Transactions & Audit Log ({payments.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-stone-800/40">
                    <td className="p-3.5 font-medium text-white">{pay.userName} ({pay.userEmail})</td>
                    <td className="p-3.5 text-stone-300">{pay.planName}</td>
                    <td className="p-3.5 font-bold text-emerald-400">₹{pay.amount}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pay.status === 'Successful'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : pay.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-stone-400">{pay.orderId}</td>
                    <td className="p-3.5 text-stone-500">{new Date(pay.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-stone-400">{pay.method || 'Razorpay Gateway'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Telegram VIP Settings */}
      {activeTab === 'telegram' && (
        <div className="max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" />
              <span>Telegram VIP Community Settings</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Configure the invite link provided to verified adult premium members.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Telegram Community Invite Link
            </label>
            <input
              type="url"
              required
              placeholder="https://t.me/+YourTelegramLink"
              value={newTelegramLink}
              onChange={e => setNewTelegramLink(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-stone-500">
              This link is kept strictly private and only shown to paying verified members via server authorization.
            </p>
          </div>

          <button
            onClick={handleSaveTelegram}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Telegram Invite Link</span>
          </button>
        </div>
      )}

      {/* Tab 7: Manage Cities */}
      {activeTab === 'cities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City List */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Active Cities ({cities.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {cities.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs">
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[11px] text-stone-500">{c.state}</div>
                    </div>
                    <button
                      onClick={() => handleToggleCityActive(c.id, c.active)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                        c.active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {c.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add City Form */}
            <form onSubmit={handleAddCity} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 h-fit">
              <h3 className="text-base font-bold text-white">Add New City</h3>
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  City Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune, Kolkata, Chandigarh"
                  value={newCityName}
                  onChange={e => setNewCityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  State / Region (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={newCityState}
                  onChange={e => setNewCityState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add City</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
