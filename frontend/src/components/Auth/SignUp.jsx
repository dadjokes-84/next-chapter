import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function SignUp() {
<<<<<<< HEAD
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
=======
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
<<<<<<< HEAD
    if (!formData.email || !formData.password || !formData.name) {
      setError('Email, password, and name are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
=======
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

<<<<<<< HEAD
    setLoading(true);
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
      });

      // Redirect to welcome/onboarding
      navigate('/welcome');
=======
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.firstName, formData.lastName);
      navigate('/profile-setup');
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Next-Chapter</h1>
        <p className="text-gray-600 mb-6">Dating for single parents</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
=======
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Your age"
            />
          </div>

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
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Confirm password"
            />
          </div>
=======
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
            />
          </div>

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            Log In
          </button>
=======
            className="w-full py-2 bg-primary text-white font-semibold rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">
            Log in
          </a>
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
        </p>
      </div>
    </div>
  );
}
