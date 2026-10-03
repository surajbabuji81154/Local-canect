import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MoreVertical,
  ArrowLeft,
  Ban,
  AlertTriangle,
  Trash2,
  Check,
  CheckCheck,
  Shield,
  MessageSquare,
  Search,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import type { Conversation, Message, SafeUser } from '../types/index.ts';

interface MessagesPageProps {
  initialConversationId?: string;
  initialRecipient?: SafeUser;
  onOpenReport: (user: SafeUser) => void;
  onOpenBlock: (user: SafeUser) => void;
  onExplore: () => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  initialConversationId,
  initialRecipient,
  onOpenReport,
  onOpenBlock,
  onExplore
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [activeOtherUser, setActiveOtherUser] = useState<SafeUser | null>(initialRecipient || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [searchConv, setSearchConv] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);

      // If we don't have active conversation selected, pick the first one on desktop
      if (!activeConvId && !initialRecipient && res.conversations.length > 0 && window.innerWidth >= 768) {
        setActiveConvId(res.conversations[0].id);
        setActiveOtherUser(res.conversations[0].otherUser || null);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages for active conversation
  const loadMessages = async () => {
    if (!activeConvId) return;
    try {
      const res = await api.getMessages(activeConvId);
      setMessages(res.messages);
      if (res.otherUser) {
        setActiveOtherUser(res.otherUser);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    setSendError(null);

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const payload: { recipientId?: string; conversationId?: string; text: string } = {
        text: textToSend
      };

      if (activeConvId) {
        payload.conversationId = activeConvId;
      } else if (activeOtherUser) {
        payload.recipientId = activeOtherUser.id;
      } else {
        throw new Error('Please select a recipient');
      }

      const res = await api.sendMessage(payload);

      // Optimistically append
      setMessages(prev => [...prev, res.message]);
      setActiveConvId(res.conversationId);
      loadConversations();
    } catch (err: any) {
      setSendError(err.message || 'Failed to send message.');
      setInputText(textToSend); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handleUnmatch = async () => {
    if (!activeConvId) return;
    if (!window.confirm('Are you sure you want to unmatch and delete this conversation? This cannot be undone.')) {
      return;
    }
    try {
      await api.unmatchConversation(activeConvId);
      setActiveConvId(null);
      setActiveOtherUser(null);
      setMessages([]);
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to unmatch.');
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchConv) return true;
    const name = c.otherUser?.name.toLowerCase() || '';
    return name.includes(searchConv.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-8rem)] min-h-[550px]">
      <div className="h-full bg-stone-900/90 dark:bg-stone-900/90 light:bg-white border border-stone-800 dark:border-stone-800 light:border-stone-200 rounded-3xl overflow-hidden shadow-2xl flex">
        {/* Left Side: Conversations List (Hidden on mobile if chat is active) */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-stone-800 dark:border-stone-800 light:border-stone-200 flex flex-col shrink-0 ${
            activeConvId || activeOtherUser ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-stone-800 dark:border-stone-800 light:border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white dark:text-white light:text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-500" />
                <span>Messages</span>
              </h2>
              <span className="text-[11px] font-semibold text-stone-400">
                {conversations.length} Active
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchConv}
                onChange={e => setSearchConv(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          </div>

          {/* Conversation list items */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-800/40">
            {loading ? (
              <div className="p-8 text-center text-xs text-stone-500">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-stone-400">No active conversations yet.</p>
                <button
                  onClick={onExplore}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Discover Singles
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const other = conv.otherUser;
                const isSelected = activeConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setActiveOtherUser(other || null);
                    }}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition cursor-pointer hover:bg-stone-800/40 ${
                      isSelected ? 'bg-stone-800/80' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={other?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={other?.name || 'User'}
                        className="w-11 h-11 rounded-full object-cover border border-stone-700"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-semibold text-xs text-white truncate">
                          {other?.name || 'User'}
                        </span>
                        <span className="text-[10px] text-stone-500 shrink-0">
                          {conv.lastMessage
                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-stone-400 truncate pr-2">
                          {conv.lastMessage?.text || 'Start conversation...'}
                        </p>
                        {(conv.unreadCount || 0) > 0 && (
                          <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Box */}
        {activeConvId || activeOtherUser ? (
          <div className="flex-1 flex flex-col h-full bg-stone-950/40">
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 border-b border-stone-800 dark:border-stone-800 light:border-stone-200 bg-stone-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveConvId(null);
                    setActiveOtherUser(null);
                  }}
                  className="md:hidden p-1.5 text-stone-400 hover:text-white rounded-lg transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={activeOtherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={activeOtherUser?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-rose-500/40"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">
                      {activeOtherUser?.name || 'User'}
                    </span>
                    <span className="text-xs font-semibold text-rose-300">
                      {activeOtherUser?.age}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{activeOtherUser?.city || 'Online'}</span>
                    <span className="text-stone-600">·</span>
                    <span className="text-stone-400">Strictly 18+</span>
                  </div>
                </div>
              </div>

              {/* Chat action menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-1.5 z-20 space-y-1 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleUnmatch();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                      <span>Unmatch & Delete</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        if (activeOtherUser) onOpenBlock(activeOtherUser);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl flex items-center gap-2"
                    >
                      <Ban className="w-3.5 h-3.5 text-stone-400" />
                      <span>Block User</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        if (activeOtherUser) onOpenReport(activeOtherUser);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-stone-800 rounded-xl flex items-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Report User</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {/* Safety notice in chat */}
              <div className="max-w-md mx-auto p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 text-center flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Keep it safe: Never share bank details, OTPs, or exact home address.</span>
              </div>

              {messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400 space-y-1">
                  <p className="font-semibold text-stone-300">Start the conversation</p>
                  <p>Send a warm, respectful hello to break the ice.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === user?.id;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-rose-600 text-white rounded-br-none shadow-md shadow-rose-600/20'
                            : 'bg-stone-800/90 text-stone-100 rounded-bl-none border border-stone-700/50'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-500 px-1">
                        <span>{time}</span>
                        {isMine && (
                          msg.read ? (
                            <CheckCheck className="w-3 h-3 text-rose-400" />
                          ) : (
                            <Check className="w-3 h-3 text-stone-500" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error prompt */}
            {sendError && (
              <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 text-xs text-rose-300">
                {sendError}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-stone-900/90 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a respectful message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  maxLength={1000}
                  className="flex-1 px-4 py-3 bg-stone-950 border border-stone-800 rounded-2xl text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-rose-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-2xl transition shadow-md shadow-rose-600/30 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center space-y-4">
            <div className="max-w-xs space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-stone-800/60 border border-stone-700/50 flex items-center justify-center text-stone-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-white">Select a Conversation</h3>
              <p className="text-xs text-stone-400">
                Choose a chat from the left or discover new singles in your city to begin conversations.
              </p>
              <button
                onClick={onExplore}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Browse Singles
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
