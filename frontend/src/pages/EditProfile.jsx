import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const INTEREST_CATEGORIES = {
  'Outdoors': ['Hiking', 'Camping', 'Biking', 'Gardening', 'Beach', 'Rock Climbing'],
  'Creative': ['Photography', 'Painting', 'Music', 'Writing', 'Dancing', 'Theater'],
  'Sports': ['Running', 'Yoga', 'Swimming', 'Soccer', 'Tennis', 'Gym'],
  'Entertainment': ['Movies', 'Gaming', 'Reading', 'Podcasts', 'Comedy', 'Concerts'],
  'Food & Drink': ['Cooking', 'Baking', 'Wine', 'Coffee', 'Food Blogging', 'Grilling'],
  'Family': ['Board Games', 'Outdoor Activities', 'Travel', 'Cooking with Kids', 'Movie Nights', 'Crafts'],
  'Wellness': ['Meditation', 'Fitness', 'Nutrition', 'Journaling', 'Self-Care', 'Mental Health'],
  'Intellectual': ['Learning', 'Science', 'History', 'Philosophy', 'Languages', 'Current Events'],
};

export default function EditProfile() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    num_kids: '',
    kids_ages: '', // "3,7" or "single parent, no kids"
    kids_genders: '', // "M,F" or similar
    looking_for: 'relationship',
    interests: [],
  });

  const [expandedCategory, setExpandedCategory] = useState(null);

  // Fetch current profile
  useEffect(() => {
    if (!user?.id || !token) return;

    fetch(`${API_URL}/profiles/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setFormData({
            bio: data.user?.bio || '',
            location: data.user?.location || '',
            num_kids: data.profile.num_kids ?? '',
            kids_ages: data.profile.kids_ages || '',
            kids_genders: data.profile.kids_genders || '',
            looking_for: data.profile.looking_for || 'relationship',
            interests: data.profile.interests || [],
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: formData.bio,
          location: formData.location,
          num_kids: formData.num_kids ? parseInt(formData.num_kids) : null,
          kids_ages: formData.kids_ages,
          kids_genders: formData.kids_genders,
          looking_for: formData.looking_for,
          interests: formData.interests,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Profile updated! 🎉');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 text-2xl">
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <label className="block text-sm font-semibold text-gray-800 mb-2">About You</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell people about yourself… (250 chars max)"
              maxLength={250}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/250</p>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, State (e.g., Chicago, IL)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            />
          </div>

          {/* Kids Info */}
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            <h3 className="font-semibold text-gray-800">Your Kids</h3>

            <div>
              <label className="block text-sm text-gray-700 mb-2">How many kids?</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, '5+'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, num_kids: String(n) }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      String(formData.num_kids) === String(n)
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {formData.num_kids && parseInt(formData.num_kids) > 0 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Ages (comma-separated)</label>
                  <input
                    type="text"
                    name="kids_ages"
                    value={formData.kids_ages}
                    onChange={handleInputChange}
                    placeholder="e.g. 3, 7, 12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Genders (optional, comma-separated)</label>
                  <input
                    type="text"
                    name="kids_genders"
                    value={formData.kids_genders}
                    onChange={handleInputChange}
                    placeholder="e.g. M, F, M"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>
              </>
            )}
          </div>

          {/* Looking For */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Looking For</label>
            <div className="grid grid-cols-3 gap-2">
              {['relationship', 'casual', 'friendship'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, looking_for: opt }))}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
                    formData.looking_for === opt
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt === 'relationship'
                    ? '💑 Relationship'
                    : opt === 'casual'
                      ? '😊 Casual'
                      : '🤝 Friendship'}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold text-gray-800 mb-4">Interests</h3>
            <div className="space-y-2">
              {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
                <div key={category}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCategory(expandedCategory === category ? null : category)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-sm font-medium text-gray-800"
                  >
                    <span>{category}</span>
                    <span className="text-lg">{expandedCategory === category ? '−' : '+'}</span>
                  </button>

                  {expandedCategory === category && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg mt-1">
                      {interests.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            formData.interests.includes(interest)
                              ? 'bg-rose-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-rose-300'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Selected: {formData.interests.length > 0 ? formData.interests.join(', ') : 'None yet'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
