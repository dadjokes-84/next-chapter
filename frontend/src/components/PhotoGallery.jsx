import { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function PhotoGallery({ userId, token, photos = [], onPhotosChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/profiles/${userId}/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onPhotosChange([...photos, data.photoUrl]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      const res = await fetch(`${API_URL}/profiles/${userId}/photos/${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      onPhotosChange(photos.filter((_, i) => i !== index));
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPhotos = [...photos];
    const [dragged] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(dropIndex, 0, dragged);

    onPhotosChange(newPhotos);

    // Sync with backend
    try {
      await fetch(`${API_URL}/profiles/${userId}/photos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photoUrls: newPhotos }),
      });
    } catch (err) {
      console.error('Reorder failed:', err);
    }

    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Photos (Max 5)</label>

        {/* Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {photos.map((photo, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(i)}
                className={`relative group cursor-move rounded-lg overflow-hidden bg-gray-100 aspect-square ${
                  draggedIndex === i ? 'opacity-50' : ''
                }`}
              >
                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

                {/* Badge */}
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Primary
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(i)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                >
                  ✕
                </button>

                {/* Drag hint */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition text-center">
                  Drag to reorder
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add photo button */}
        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-300 transition disabled:opacity-50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-3xl mb-2">📷</p>
            <p className="text-gray-600 text-sm">{uploading ? 'Uploading…' : 'Click to add photo'}</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 5MB</p>
          </button>
        )}

        {photos.length >= 5 && (
          <p className="text-sm text-gray-500 text-center py-4">📸 You've reached the 5-photo limit</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
