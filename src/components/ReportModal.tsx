import React, { useState } from 'react';
import { AlertTriangle, X, Check, Shield } from 'lucide-react';
import { api } from '../services/api.ts';
import type { SafeUser } from '../types/index.ts';

interface ReportModalProps {
  user: SafeUser;
  onClose: () => void;
  onReported?: () => void;
}

const REPORT_REASONS = [
  'Underage Account Suspected (Under 18)',
  'Harassment or Offensive Messages',
  'Commercial Solicitation or Scam',
  'Fake Photos or Impersonation',
  'Inappropriate or Abusive Behavior',
  'Other Safety Concern'
];

export const ReportModal: React.FC<ReportModalProps> = ({ user, onClose, onReported }) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.reportUser({
        reportedUserId: user.id,
        reason: selectedReason,
        details
      });
      setSuccess(true);
      setTimeout(() => {
        if (onReported) onReported();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl p-6 text-stone-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Report {user.name}</h3>
            <p className="text-xs text-stone-400">Strictly confidential · Handled by moderation team</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">Report Submitted</h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Thank you for keeping LocalConnect safe. Our safety team will review this account promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Reason for report
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map(reason => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedReason === reason
                        ? 'border-rose-500/60 bg-rose-500/10 text-white font-medium'
                        : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe what occurred with specific timestamps or messages..."
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder:text-stone-600 text-xs focus:outline-none focus:border-rose-500 transition resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs text-stone-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-sm shadow-rose-600/30"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
