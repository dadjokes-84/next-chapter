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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

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
      </div>
    </div>
  );
}
