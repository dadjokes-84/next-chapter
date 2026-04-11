import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    navigate('/profile-setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-white mb-2">Next Chapter ❤️</h1>
        <p className="text-xl text-white/80">Find love. Real parents, no BS.</p>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6">
        {/* Welcome message */}
        <div className="text-center space-y-3">
          <p className="text-4xl">👋</p>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 text-sm">
            Let's set up your profile so you can start meeting real single parents in your area.
          </p>
        </div>

        {/* What you get */}
        <div className="bg-rose-50 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-rose-900 uppercase">Here's what you get:</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2 items-start">
              <span className="text-lg">🎯</span>
              <p>Smart matching with other single parents</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-lg">💬</span>
              <p>10 messages/day free (unlimited with premium)</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-lg">✅</span>
              <p>Verified profiles — everyone's real</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-lg">🔒</span>
              <p>Your privacy matters — no ads, no spam</p>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 space-y-1">
          <p className="font-semibold">🔐 About that selfie:</p>
          <p>We ask for a verified selfie to keep everyone safe. You control who sees what.</p>
        </div>

        {/* Timeline */}
        <div className="space-y-2 text-xs text-gray-600">
          <p className="font-semibold text-gray-800">Setup takes ~5 minutes:</p>
          <div className="space-y-1">
            <p>📸 Selfie (verification)</p>
            <p>🖼️ Photos (3-5 is ideal)</p>
            <p>📝 Bio & location</p>
            <p>👨‍👧 Kids info</p>
            <p>💫 Your vibe (interests, looking for…)</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl transition shadow-lg text-lg"
        >
          Let's Get Started
        </button>

        {/* Skip option */}
        <button
          onClick={() => navigate('/discover')}
          className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
        >
          Skip for now
        </button>
      </div>

      {/* Footer */}
      <p className="text-white/60 text-xs mt-8">
        You can edit your profile anytime from your dashboard.
      </p>
    </div>
  );
}
