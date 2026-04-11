import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
<<<<<<< HEAD
  const navigate = useNavigate();
  const { login } = useAuth();
=======
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
=======
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
<<<<<<< HEAD
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Redirect to dashboard
      navigate('/dashboard');
=======
      await login(formData.email, formData.password);
      navigate('/discover');
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Next-Chapter</h1>
        <p className="text-gray-600 mb-6">Welcome back</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
=======
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Your password"
            />
          </div>
=======
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054

          <button
            type="submit"
            disabled={loading}
<<<<<<< HEAD
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
=======
            className="w-full py-2 bg-primary text-white font-semibold rounded hover:opacity-90 disabled:opacity-50"
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

<<<<<<< HEAD
        <p className="text-center text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            Sign Up
          </button>
=======
        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
        </p>
      </div>
    </div>
  );
}
