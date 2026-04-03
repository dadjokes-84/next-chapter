import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold text-white mb-4">Next-Chapter</h1>
        <p className="text-xl text-rose-100 mb-8">
          Dating for single parents. Affordable. Ad-free. Built for real life.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-white text-rose-500 font-bold py-3 rounded-lg hover:bg-rose-50 transition"
          >
            Create Account
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-rose-400 hover:bg-rose-300 text-white font-bold py-3 rounded-lg transition"
          >
            Log In
          </button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-white">
          <div>
            <p className="text-3xl font-bold">💰</p>
            <p className="text-sm mt-2">$5.99/month</p>
            <p className="text-xs text-rose-100">Most affordable option</p>
          </div>
          <div>
            <p className="text-3xl font-bold">✨</p>
            <p className="text-sm mt-2">Zero Ads</p>
            <p className="text-xs text-rose-100">Clean experience</p>
          </div>
          <div>
            <p className="text-3xl font-bold">🔒</p>
            <p className="text-sm mt-2">Verified</p>
            <p className="text-xs text-rose-100">Safe connections</p>
          </div>
        </div>
      </div>
    </div>
  );
}
