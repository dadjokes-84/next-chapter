import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!token) return;

    // Fetch matches
    fetch(`${API_URL}/discover/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setMatches(data.matches || []);
      })
      .catch(console.error)
      .finally(() => setLoadingMatches(false));

    // Check if profile is complete
    if (user?.id) {
      fetch(`${API_URL}/profiles/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          const p = data.profile;
          setProfileComplete(!!(p?.num_kids != null && p?.looking_for && data.user?.selfie_url));
        })
        .catch(console.error);
    }
  }, [token, user]);

  const steps = [
    {
      done: !!user?.selfie_url,
      icon: '📸',
      label: 'Selfie verified',
      action: () => navigate('/profile-setup'),
      cta: 'Upload selfie',
    },
    {
      done: profileComplete,
      icon: '👤',
      label: 'Profile complete',
      action: () => navigate('/profile-setup'),
      cta: 'Complete profile',
    },
    {
      done: matches.length > 0,
      icon: '❤️',
      label: 'First match',
      action: () => navigate('/discover'),
      cta: 'Start swiping',
    },
  ];

  const completedSteps = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-rose-500">Next Chapter ❤️</h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate('/discover')}
              className="text-rose-500 hover:text-rose-600 font-medium text-sm"
            >
              Discover
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 text-sm mb-4">Here's what's happening on Next Chapter.</p>

          {/* Progress bar */}
          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>Profile progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step cards */}
          <div className="grid grid-cols-3 gap-3">
            {steps.map((step) => (
              <button
                key={step.label}
                onClick={step.done ? undefined : step.action}
                className={`rounded-xl p-3 text-center transition ${
                  step.done
                    ? 'bg-green-50 border border-green-200 cursor-default'
                    : 'bg-rose-50 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span className="text-2xl">{step.done ? '✅' : step.icon}</span>
                <p className={`text-xs mt-1 font-medium ${step.done ? 'text-green-700' : 'text-rose-700'}`}>
                  {step.done ? step.label : step.cta}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Matches */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Your Matches</h3>
            {matches.length > 0 && (
              <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-medium">
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          {loadingMatches ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🌸</p>
              <p className="text-gray-500 text-sm mb-4">No matches yet. Go find your people!</p>
              <button
                onClick={() => navigate('/discover')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-6 rounded-lg transition text-sm"
              >
                Start Swiping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const partner = match.matched_user;
                const photo = partner?.selfie_url;
                return (
                  <button
                    key={match.id}
                    onClick={() => navigate(`/messages/${match.id}`)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {photo ? (
                        <img src={photo} alt={partner.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">
                        {partner?.name}{partner?.age ? `, ${partner.age}` : ''}
                      </p>
                      {partner?.location && (
                        <p className="text-xs text-gray-400 truncate">📍 {partner.location}</p>
                      )}
                    </div>
                    <span className="text-rose-400 text-sm">💬</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/discover')}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl transition shadow"
          >
            ❤️ Discover
          </button>
          <button
            onClick={() => navigate('/edit-profile')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl transition shadow border border-gray-200"
          >
            ✏️ Edit Profile
          </button>
        </div>

      </div>
    </div>
  );
}
