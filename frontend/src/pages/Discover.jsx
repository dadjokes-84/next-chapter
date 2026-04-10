import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchMessage, setMatchMessage] = useState('');
  const { getAuthToken } = useAuth();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/matches/discover`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load profiles');
      }

      const data = await response.json();
      setProfiles(data);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSwipe = async (action, targetId) => {
    try {
      const token = getAuthToken();
      const endpoint = action === 'like' ? 'like' : 'pass';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/matches/${endpoint}/${targetId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action}`);
      }

      const result = await response.json();

      if (result.match) {
        setMatchMessage(`🎉 It's a match with ${profiles[currentIndex].name}!`);
        // Wait 3 seconds before moving to next profile
        setTimeout(() => {
          setMatchMessage('');
          // Move to next profile
          if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            fetchProfiles();
          }
        }, 3000);
      } else {
        // Move to next profile immediately if no match
        if (currentIndex < profiles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          fetchProfiles();
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-800 mb-4">No more profiles</p>
          <p className="text-gray-600 mb-6">Check back soon for new matches!</p>
          <button
            onClick={fetchProfiles}
            className="px-6 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const profile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Discover</h1>
          <p className="text-sm sm:text-base text-gray-600">{currentIndex + 1} of {profiles.length}</p>
        </div>

        {/* Match Message */}
        {matchMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
            {matchMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Profile Image */}
          <div className="relative bg-gradient-to-br from-pink-200 to-purple-200 h-96 flex items-center justify-center">
            {profile.selfie_url ? (
              <img
                src={profile.selfie_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-400">
                <p>📷 No photo</p>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-gray-600 mb-4 flex items-center">
              📍 {profile.location}
            </p>

            {profile.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => handleSwipe('pass', profile.id)}
            className="flex-1 min-h-12 sm:min-h-11 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
          >
            ✗ Pass
          </button>
          <button
            onClick={() => handleSwipe('like', profile.id)}
            className="flex-1 min-h-12 sm:min-h-11 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition text-sm sm:text-base"
          >
            ♥ Like
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 justify-center">
          <a
            href="/messages"
            className="px-3 py-2 sm:px-4 sm:py-2 text-primary hover:underline font-semibold text-sm sm:text-base"
          >
            💬 Messages
          </a>
          <a
            href="/matches"
            className="px-3 py-2 sm:px-4 sm:py-2 text-primary hover:underline font-semibold text-sm sm:text-base"
          >
            💕 Matches
          </a>
          <a
            href="/preferences"
            className="px-3 py-2 sm:px-4 sm:py-2 text-primary hover:underline font-semibold text-sm sm:text-base"
          >
            ⚙️ Preferences
          </a>
        </div>
      </div>
    </div>
  );
}
