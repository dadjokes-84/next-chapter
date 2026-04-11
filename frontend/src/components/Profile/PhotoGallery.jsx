import { useState, useRef, useCallback } from 'react';

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoGallery({ userId, initialPhotos = [], onPhotosChange }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('authToken');

  const notify = (updated) => {
    setPhotos(updated);
    onPhotosChange?.(updated);
  };

  // ── File validation ──────────────────────────────────────
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WEBP images are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File must be under 5MB.';
    }
    return null;
  };

  // ── Upload ───────────────────────────────────────────────
  const uploadFile = async (file) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      setError('You can only have up to 5 photos.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      // Simulate progress ticks while waiting
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 85));
      }, 300);

      const res = await fetch(`${API_URL}/profiles/${userId}/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      notify(data.photo_urls);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = ''; // reset so same file can be re-picked
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (index) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/profiles/${userId}/photos/${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }

      const data = await res.json();
      notify(data.photo_urls);
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  // ── Drag-to-reorder ──────────────────────────────────────
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...photos];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Optimistic update
    notify(reordered);
    setDragIndex(null);
    setDragOverIndex(null);

    try {
      const res = await fetch(`${API_URL}/profiles/${userId}/photos/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photo_urls: reordered }),
      });

      if (!res.ok) {
        // Roll back
        notify(photos);
        const err = await res.json();
        setError(err.error || 'Reorder failed');
      }
    } catch {
      notify(photos);
      setError('Reorder failed');
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ── Drop zone (add photo area) ───────────────────────────
  const handleZoneDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-gray-700 font-medium">
          Your Photos{' '}
          <span className="text-sm font-normal text-gray-500">
            ({photos.length}/{MAX_PHOTOS})
          </span>
        </label>
        {photos.length > 0 && (
          <span className="text-xs text-gray-400">Drag to reorder · first photo is your primary</span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${
              dragOverIndex === index && dragIndex !== index
                ? 'border-rose-400 scale-105'
                : 'border-gray-200'
            } ${dragIndex === index ? 'opacity-50' : 'opacity-100'}`}
          >
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Primary badge */}
            {index === 0 && (
              <div className="absolute top-1 left-1 bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                Primary
              </div>
            )}

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
              title="Delete photo"
            >
              ✕
            </button>

            {/* Drag handle hint */}
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
            </div>
          </div>
        ))}

        {/* Add photo slot */}
        {photos.length < MAX_PHOTOS && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleZoneDrop}
            className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50'
            }`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 px-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">Uploading…</span>
              </div>
            ) : (
              <>
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs text-gray-500 text-center px-1">
                  {dragOver ? 'Drop here' : 'Add photo'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-400">
        JPG, PNG, or WEBP · max 5MB each · up to 5 photos
      </p>
    </div>
  );
}
