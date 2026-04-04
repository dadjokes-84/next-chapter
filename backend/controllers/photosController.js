import { supabase } from '../utils/supabase.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PHOTOS = 5;

/**
 * Upload a photo
 * POST /api/profiles/:userId/photos
 * Body: multipart/form-data with 'file' field
 */
export const uploadPhoto = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify ownership
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, WebP allowed.' });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large. Max 5MB.' });
    }

    // Get current photos
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('photo_urls')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const currentPhotos = profile?.photo_urls || [];
    if (currentPhotos.length >= MAX_PHOTOS) {
      return res.status(400).json({ error: `Maximum ${MAX_PHOTOS} photos allowed` });
    }

    // Upload to Supabase Storage
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const path = `profiles/${userId}/photos/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(path);
    const photoUrl = urlData.publicUrl;

    // Add to photo_urls array
    const updatedPhotos = [...currentPhotos, photoUrl];

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        photo_urls: updatedPhotos,
        updated_at: new Date(),
      }, { onConflict: 'user_id' });

    if (updateError) throw updateError;

    res.status(201).json({ photoUrl, totalPhotos: updatedPhotos.length });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

/**
 * Delete a photo by index
 * DELETE /api/profiles/:userId/photos/:photoIndex
 */
export const deletePhoto = async (req, res) => {
  try {
    const { userId, photoIndex } = req.params;
    const index = parseInt(photoIndex);

    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('photo_urls')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const photos = profile.photo_urls || [];
    if (index < 0 || index >= photos.length) {
      return res.status(400).json({ error: 'Invalid photo index' });
    }

    const photoUrl = photos[index];
    const newPhotos = photos.filter((_, i) => i !== index);

    // Delete from storage
    const pathMatch = photoUrl.match(/profiles\/([^?]+)/);
    if (pathMatch) {
      const path = `profiles/${pathMatch[1]}`;
      await supabase.storage.from('profiles').remove([path]);
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_urls: newPhotos, updated_at: new Date() })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    res.json({ success: true, totalPhotos: newPhotos.length });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};

/**
 * Reorder photos
 * PUT /api/profiles/:userId/photos
 * Body: { photoUrls: [...reordered] }
 */
export const reorderPhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { photoUrls } = req.body;

    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!Array.isArray(photoUrls)) {
      return res.status(400).json({ error: 'photoUrls must be an array' });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ photo_urls: photoUrls, updated_at: new Date() })
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Reorder photos error:', error);
    res.status(500).json({ error: 'Failed to reorder photos' });
  }
};
