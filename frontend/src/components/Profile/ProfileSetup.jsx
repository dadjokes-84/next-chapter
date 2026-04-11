import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
<<<<<<< HEAD
import PhotoGallery from './PhotoGallery';

const TOTAL_STEPS = 5;

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Selfie, 2: Bio, 3: Kids, 4: Preferences, 5: Photos
  const [formData, setFormData] = useState({
    selfie_url: null,
    bio: '',
    location: '',
    num_kids: '',
    kids_ages: '',
    looking_for: 'relationship',
    interests: [],
    photo_urls: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, selfie_url: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
=======

export default function ProfileSetup() {
  const [formData, setFormData] = useState({
    age: '',
    location: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAuthToken } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
<<<<<<< HEAD
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');

      // ── Step 1: Selfie ──────────────────────────────────
      if (step === 1) {
        if (!formData.selfie_url) {
          setError('Please upload a selfie');
          setLoading(false);
          return;
        }

        const selfieRes = await fetch(`${API_URL}/profiles/${user.id}/selfie`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ selfie_url: formData.selfie_url }),
        });

        if (!selfieRes.ok) {
          const err = await selfieRes.json();
          throw new Error(err.error);
        }

        setStep(2);
      }

      // ── Steps 2–4: Profile fields ───────────────────────
      else if (step >= 2 && step <= 4) {
        const profileRes = await fetch(`${API_URL}/profiles/${user.id}`, {
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
            looking_for: formData.looking_for,
            interests: formData.interests,
          }),
        });

        if (!profileRes.ok) {
          const err = await profileRes.json();
          throw new Error(err.error);
        }

        setStep(step + 1);
      }

      // ── Step 5: Photos (done — navigate) ────────────────
      else if (step === 5) {
        // Photos are saved incrementally via PhotoGallery; just finish
        navigate('/discover');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
=======

    if (!formData.age || !formData.location) {
      setError('Age and location are required');
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profiles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          location: formData.location,
          bio: formData.bio,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      navigate('/discover');
    } catch (err) {
      setError(err.message || 'Profile setup failed');
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
=======
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Complete Your Profile</h2>
        <p className="text-center text-gray-600 mb-8">Help us find your perfect match</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD

          {/* ── Step 1: Selfie ──────────────────────────── */}
          {step === 1 && (
            <div>
              <label className="block text-gray-700 font-medium mb-4">Upload a selfie</label>
              {formData.selfie_url ? (
                <div className="mb-4">
                  <img src={formData.selfie_url} alt="Your selfie" className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, selfie_url: null }))}
                    className="mt-2 text-rose-500 hover:text-rose-600 text-sm"
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="selfie-input"
                  />
                  <label htmlFor="selfie-input" className="cursor-pointer">
                    <p className="text-3xl mb-2">📸</p>
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
              )}
              <div className="mt-4 space-y-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-900">📸 Selfie tips:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>✓ Good lighting (natural or soft indoor)</li>
                  <li>✓ Face clearly visible, no sunglasses</li>
                  <li>✓ Recent photo (taken in last 3 months)</li>
                  <li>✓ Just you — no other people or heavy filters</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Step 2: Bio & Location ──────────────────── */}
          {step === 2 && (
            <div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Tell others about yourself..."
                  rows="3"
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="City, State"
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Kids ────────────────────────────── */}
          {step === 3 && (
            <div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">How many kids?</label>
                <input
                  type="number"
                  name="num_kids"
                  value={formData.num_kids}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Kids' ages (comma separated)</label>
                <input
                  type="text"
                  name="kids_ages"
                  value={formData.kids_ages}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. 5, 8, 12"
                />
              </div>
            </div>
          )}

          {/* ── Step 4: Preferences ─────────────────────── */}
          {step === 4 && (
            <div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">What are you looking for?</label>
                <select
                  name="looking_for"
                  value={formData.looking_for}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="relationship">Long-term relationship</option>
                  <option value="casual">Casual dating</option>
                  <option value="friendship">Friendship</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Interests</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Hiking', 'Cooking', 'Reading', 'Sports', 'Movies', 'Travel', 'Gaming', 'Music'].map(
                    (interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          formData.interests.includes(interest)
                            ? 'bg-rose-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Photos ──────────────────────────── */}
          {step === 5 && (
            <div>
              <p className="text-gray-600 text-sm mb-4">
                Add up to 5 photos to your profile. Your first photo is shown in Discover.
              </p>
              <PhotoGallery
                userId={user?.id}
                initialPhotos={formData.photo_urls}
                onPhotosChange={(urls) =>
                  setFormData((prev) => ({ ...prev, photo_urls: urls }))
                }
              />
            </div>
          )}

          {/* ── Navigation buttons ──────────────────────── */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : step === TOTAL_STEPS
                ? 'Finish'
                : 'Next'}
            </button>
          </div>

          {step === TOTAL_STEPS && (
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-2"
            >
              Skip for now
            </button>
          )}
        </form>
=======
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="age"
              placeholder="Your age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="City, State"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
            <textarea
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white font-semibold rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Setting Up...' : 'Continue to Discover'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          You can add a photo and update your preferences later
        </p>
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
      </div>
    </div>
  );
}
