import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-rose-500">Next-Chapter</h1>
          <button
            onClick={handleLogout}
            className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 mb-6">
            Your profile is created. Next steps: Upload a selfie for verification, complete your profile, and start
            swiping!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-4 rounded-lg transition">
              📸 Upload Selfie
            </button>
            <button className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-4 rounded-lg transition">
              👤 Complete Profile
            </button>
            <button className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-4 rounded-lg transition">
              ❤️ Start Swiping
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Coming Soon:</strong> Profile verification, matching algorithm, and messaging system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
