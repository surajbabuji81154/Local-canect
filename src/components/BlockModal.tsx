import React, { useState } from 'react';
import { Ban, X } from 'lucide-react';
import { api } from '../services/api.ts';
import type { SafeUser } from '../types/index.ts';

interface BlockModalProps {
  user: SafeUser;
  onClose: () => void;
  onBlocked: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({ user, onClose, onBlocked }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.blockUser(user.id);
      onBlocked();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to block user.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 text-stone-100 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <Ban className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Block {user.name}?</h3>

        <p className="text-xs text-stone-400 leading-relaxed mb-6">
          {user.name} will not be able to message you, view your profile, or see you in discovery. Any ongoing chats will be removed.
        </p>

        {error && (
          <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBlock}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-sm shadow-rose-600/30"
          >
            {loading ? 'Blocking...' : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  );
};
