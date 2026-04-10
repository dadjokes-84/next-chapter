import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getAuthToken } = useAuth();
  const navigate = useNavigate();

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
          <p>Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Your Matches</h1>
          <p className="text-sm sm:text-base text-gray-600">{matches.length} connection{matches.length !== 1 ? 's' : ''}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        {/* No Matches */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">No matches yet</p>
            <p className="text-gray-500 mb-6">Keep swiping to find your perfect match!</p>
            <button
              onClick={() => navigate('/discover')}
              className="px-6 py-2 bg-primary text-white rounded hover:opacity-90"
            >
              Back to Discover
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {matches.map(match => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer active:shadow-md"
                onClick={() => navigate(`/messages/${match.id}`)}
              >
                {/* Match Image */}
                <div className="relative bg-gradient-to-br from-pink-200 to-purple-200 h-48 sm:h-40 flex items-center justify-center">
                  {match.matchedUser?.selfie_url ? (
                    <img
                      src={match.matchedUser.selfie_url}
                      alt={match.matchedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <p>📷 No photo</p>
                    </div>
                  )}
                </div>

                {/* Match Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {match.matchedUser?.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    📍 {match.matchedUser?.location}
                  </p>

                  {match.matchedUser?.bio && (
                    <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                      {match.matchedUser.bio}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/messages');
                    }}
                    className="w-full min-h-10 bg-primary text-white rounded hover:opacity-90 transition text-sm sm:text-base font-semibold"
                  >
                    💬 Message
                  </button>
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
            onClick={() => navigate('/messages')}
            className="px-4 py-2 text-primary hover:underline font-semibold"
          >
            💬 Messages
          </button>
          <button
            onClick={() => navigate('/preferences')}
            className="px-4 py-2 text-primary hover:underline font-semibold"
          >
            ⚙️ Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
