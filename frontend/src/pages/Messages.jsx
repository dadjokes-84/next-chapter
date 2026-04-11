<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const POLL_INTERVAL_MS = 5000;
const DAILY_LIMIT = 10;

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function Messages() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [messagesUsedToday, setMessagesUsedToday] = useState(0);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  // Resolve current user id from token (JWT payload middle segment)
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  })();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messages/${matchId}`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load messages');
      }

      const data = await res.json();
      setMessages(data.messages || []);
      setPartner(data.partner || null);
      setIsPaid(data.isPaid ?? false);
      setMessagesUsedToday(data.messagesUsedToday ?? 0);
      setError(null);
=======
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ChatWindow from '../components/Chat/ChatWindow';

export default function Messages() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getAuthToken } = useAuth();
  const navigate = useNavigate();
  const { matchId } = useParams();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/matches`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load matches');
      }

      const data = await response.json();
      setMatches(data);
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, [matchId, navigate]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Polling
  useEffect(() => {
    pollRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/messages/${matchId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setError(data.message || 'Daily message limit reached. Upgrade for unlimited messaging.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setInput('');
      // Optimistically add message, then refresh
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setMessagesUsedToday((prev) => prev + 1);
      }
      // Full refresh to sync read status etc.
      await fetchMessages();
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const remainingToday = DAILY_LIMIT - messagesUsedToday;
  const atLimit = !isPaid && messagesUsedToday >= DAILY_LIMIT;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg animate-pulse">Loading conversation…</div>
=======
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
      </div>
    );
  }

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-rose-500 transition text-xl leading-none"
            aria-label="Go back"
          >
            ←
          </button>

          {partner?.photo_url ? (
            <img
              src={partner.photo_url}
              alt={partner.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-lg">
              {partner?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-800 truncate">
              {partner?.name ?? 'Your Match'}
            </h2>
            {!isPaid && (
              <p
                className={`text-xs ${
                  remainingToday <= 2 ? 'text-rose-500 font-semibold' : 'text-gray-400'
                }`}
              >
                {atLimit
                  ? '0/10 messages today — limit reached'
                  : `${messagesUsedToday}/10 messages today`}
              </p>
            )}
          </div>

          {!isPaid && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                atLimit
                  ? 'bg-rose-100 text-rose-600'
                  : remainingToday <= 3
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {atLimit ? 'Limit reached' : `${remainingToday} left today`}
            </span>
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-4xl mb-2">💬</p>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Say hello to {partner?.name ?? 'your match'}!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.from_user_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isOwn
                    ? 'bg-rose-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isOwn ? 'text-rose-200 text-right' : 'text-gray-400'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isOwn && (
                    <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-2xl w-full mx-auto px-4 pb-2">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-2 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-rose-400 hover:text-rose-600 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Upgrade prompt when at limit */}
      {atLimit && (
        <div className="max-w-2xl w-full mx-auto px-4 pb-2">
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-center">
            <p className="text-rose-700 font-semibold text-sm mb-1">
              You've used all 10 messages today 💌
            </p>
            <p className="text-rose-500 text-xs mb-3">
              Upgrade to Premium for unlimited messaging with all your matches.
            </p>
            <button
              onClick={() => navigate('/upgrade')}
              className="bg-rose-500 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-rose-600 transition"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 sticky bottom-0">
        <form
          onSubmit={handleSend}
          className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={
              atLimit
                ? 'Upgrade for unlimited messages…'
                : `Message ${partner?.name ?? 'your match'}…`
            }
            disabled={atLimit || sending}
            rows={1}
            className={`flex-1 resize-none rounded-2xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition max-h-32 overflow-y-auto ${
              atLimit
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || atLimit || sending}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${
              !input.trim() || atLimit || sending
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md'
            }`}
            aria-label="Send message"
          >
            {sending ? (
              <span className="animate-spin text-sm">⟳</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
=======
  // Show chat window if match selected via URL
  if (matchId) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading conversation...</p>
          </div>
        </div>
      );
    }

    const selectedMatch = matches.find(m => m.id === matchId);
    if (selectedMatch) {
      return (
        <ChatWindow
          matchId={selectedMatch.id}
          matchedUser={selectedMatch.matchedUser}
          onBack={() => navigate('/messages')}
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Conversation not found</p>
            <button
              onClick={() => navigate('/messages')}
              className="px-6 py-2 bg-primary text-white rounded hover:opacity-90"
            >
              Back to Messages
            </button>
          </div>
        </div>
      );
    }
  }

  // Show conversations list
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Messages</h1>
          <p className="text-sm sm:text-base text-gray-600">{matches.length} conversation{matches.length !== 1 ? 's' : ''}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        {/* No Conversations */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">No conversations yet</p>
            <p className="text-gray-500 mb-6">Match with someone to start messaging!</p>
            <button
              onClick={() => navigate('/discover')}
              className="px-6 py-2 bg-primary text-white rounded hover:opacity-90"
            >
              Back to Discover
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {matches.map(match => (
              <div
                key={match.id}
                onClick={() => navigate(`/messages/${match.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer active:shadow-md p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
              >
                {/* Avatar */}
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {match.matchedUser?.selfie_url ? (
                    <img
                      src={match.matchedUser.selfie_url}
                      alt={match.matchedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📷</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">
                    {match.matchedUser?.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {match.matchedUser?.age}, {match.matchedUser?.location}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-gray-400">
                  →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-2 justify-center">
          <button
            onClick={() => navigate('/discover')}
            className="px-4 py-2 text-primary hover:underline font-semibold"
          >
            ← Discover
          </button>
          <button
            onClick={() => navigate('/matches')}
            className="px-4 py-2 text-primary hover:underline font-semibold"
          >
            💕 Matches
          </button>
        </div>
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
      </div>
    </div>
  );
}
