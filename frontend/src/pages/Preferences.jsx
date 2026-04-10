import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Preferences() {
  const [formData, setFormData] = useState({
    minAge: 18,
    maxAge: 65,
    interestedIn: 'all',
    distanceRadius: 50,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { getAuthToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          minAge: data.min_age,
          maxAge: data.max_age,
          interestedIn: data.interested_in,
          distanceRadius: data.distance_radius,
        });
      }
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minAge' || name === 'maxAge' || name === 'distanceRadius'
        ? parseInt(value)
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          minAge: formData.minAge,
          maxAge: formData.maxAge,
          interestedIn: formData.interestedIn,
          distanceRadius: formData.distanceRadius,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setSuccess('Preferences saved!');
      setTimeout(() => {
        navigate('/discover');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Preferences</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age Range: {formData.minAge} - {formData.maxAge}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                name="minAge"
                min="18"
                max="80"
                value={formData.minAge}
                onChange={handleChange}
                className="w-full"
              />
              <input
                type="range"
                name="maxAge"
                min="18"
                max="80"
                value={formData.maxAge}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Interested In */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Looking For
            </label>
            <select
              name="interestedIn"
              value={formData.interestedIn}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            >
              <option value="all">All Genders</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
            </select>
          </div>

          {/* Distance Radius */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Distance Radius: {formData.distanceRadius} miles
            </label>
            <input
              type="range"
              name="distanceRadius"
              min="10"
              max="500"
              step="10"
              value={formData.distanceRadius}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="flex-1 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-primary text-white font-semibold rounded hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
