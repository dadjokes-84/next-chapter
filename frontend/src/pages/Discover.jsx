import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function ProfileCard({ profile, onSwipe, isTop }) {
  const [dragState, setDragState] = useState({ dragging: false, x: 0, y: 0, startX: 0, startY: 0 });
  const cardRef = useRef(null);

  const rotation = dragState.x * 0.08;
  const likeOpacity = Math.min(Math.max(dragState.x / 80, 0), 1);
  const passOpacity = Math.min(Math.max(-dragState.x / 80, 0), 1);

  const handleMouseDown = (e) => {
    if (!isTop) return;
    setDragState({ dragging: true, x: 0, y: 0, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!dragState.dragging) return;
    setDragState((prev) => ({
      ...prev,
      x: e.clientX - prev.startX,
      y: e.clientY - prev.startY,
    }));
  };

  const handleMouseUp = () => {
    if (!dragState.dragging) return;
    const threshold = 100;
    if (dragState.x > threshold) {
      onSwipe('like', profile.id);
    } else if (dragState.x < -threshold) {
      onSwipe('pass', profile.id);
    }
    setDragState({ dragging: false, x: 0, y: 0, startX: 0, startY: 0 });
  };

  // Touch support
  const handleTouchStart = (e) => {
    if (!isTop) return;
    const touch = e.touches[0];
    setDragState({ dragging: true, x: 0, y: 0, startX: touch.clientX, startY: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!dragState.dragging) return;
    const touch = e.touches[0];
    setDragState((prev) => ({
      ...prev,
      x: touch.clientX - prev.startX,
      y: touch.clientY - prev.startY,
    }));
  };

  const handleTouchEnd = () => handleMouseUp();

  const photo = profile.profiles?.photo_url || profile.selfie_url;
  const numKids = profile.profiles?.num_kids;
  const interests = profile.profiles?.interests || [];

  return (
    <div
      ref={cardRef}
      className={`absolute w-full select-none ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{
        transform: `translate(${dragState.x}px, ${dragState.y}px) rotate(${rotation}deg)`,
        transition: dragState.dragging ? 'none' : 'transform 0.3s ease',
        zIndex: isTop ? 10 : 5,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm mx-auto">
        {/* Photo */}
        <div className="relative h-96 bg-gray-200">
          {photo ? (
            <img src={photo} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">👤</span>
            </div>
          )}

          {/* Like/Pass overlays */}
          <div
            className="absolute top-6 left-6 border-4 border-green-400 text-green-400 font-black text-2xl px-3 py-1 rounded-lg rotate-[-20deg]"
            style={{ opacity: likeOpacity }}
          >
            LIKE ❤️
          </div>
          <div
            className="absolute top-6 right-6 border-4 border-red-400 text-red-400 font-black text-2xl px-3 py-1 rounded-lg rotate-[20deg]"
            style={{ opacity: passOpacity }}
          >
            PASS ✕
          </div>

          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold">
              {profile.name}{profile.age ? `, ${profile.age}` : ''}
            </h2>
            {profile.location && (
              <p className="text-sm opacity-90">📍 {profile.location}</p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {numKids != null && (
            <p className="text-gray-600 text-sm mb-2">
              👨‍👧 {numKids === 0 ? 'No kids' : `${numKids} kid${numKids > 1 ? 's' : ''}`}
              {profile.profiles?.kids_ages ? ` (ages ${profile.profiles.kids_ages})` : ''}
            </p>
          )}
          {profile.bio && (
            <p className="text-gray-700 text-sm line-clamp-3 mb-3">{profile.bio}</p>
          )}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {interests.slice(0, 4).map((interest) => (
                <span key={interest} className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Discover() {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [error, setError] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/discover`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCandidates(data.candidates || []);
    } catch (err) {
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSwipe = async (action, targetUserId) => {
    // Optimistically remove card
    setCandidates((prev) => prev.filter((c) => c.id !== targetUserId));

    try {
      const res = await fetch(`${API_URL}/discover/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.matched) {
        const profile = candidates.find((c) => c.id === targetUserId);
        setMatchedProfile(profile);
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading profiles…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex flex-col items-center justify-center px-4">
      {/* Match Modal */}
      {matchedProfile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">It's a Match!</h2>
            <p className="text-gray-600 mb-6">
              You and <strong>{matchedProfile.name}</strong> liked each other.
            </p>
            <button
              onClick={() => setMatchedProfile(null)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-sm mb-6 flex items-center justify-between px-1">
        <h1 className="text-white text-2xl font-bold">Next Chapter ❤️</h1>
        <a href="/dashboard" className="text-white/80 hover:text-white text-sm underline">
          Dashboard
        </a>
      </div>

      {/* Card Stack */}
      {candidates.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-xl">
          <p className="text-5xl mb-4">🌸</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">You're all caught up!</h2>
          <p className="text-gray-500 mb-6">No new profiles right now. Check back soon.</p>
          <button
            onClick={fetchCandidates}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-sm" style={{ height: '520px' }}>
            {candidates.slice(0, 3).map((profile, i) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isTop={i === 0}
                onSwipe={handleSwipe}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-6 mt-6">
            <button
              onClick={() => handleSwipe('pass', candidates[0].id)}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition"
              title="Pass"
            >
              ✕
            </button>
            <button
              onClick={() => handleSwipe('like', candidates[0].id)}
              className="w-16 h-16 bg-rose-500 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition"
              title="Like"
            >
              ❤️
            </button>
          </div>

          <p className="text-white/60 text-xs mt-4">
            {candidates.length} profile{candidates.length !== 1 ? 's' : ''} remaining
          </p>
        </>
      )}

      {error && (
        <p className="mt-4 text-white bg-red-500/40 px-4 py-2 rounded-lg text-sm">{error}</p>
      )}
    </div>
  );
}
