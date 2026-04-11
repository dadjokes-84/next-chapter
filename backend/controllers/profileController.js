import { supabase } from '../utils/supabase.js';
import multer from 'multer';

// Multer: memory storage (we stream directly to Supabase Storage)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
  },
});

/**
 * Get user profile
 * GET /api/profiles/:userId
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own profile
    if (req.userId !== userId && req.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user and profile data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, age, bio, location, verified, selfie_url, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get extended profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (profile not created yet)
      throw profileError;
    }

    res.json({
      user,
      profile: profile || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

/**
 * Update user profile
 * PUT /api/profiles/:userId
 * Body: { bio, location, num_kids, kids_ages, looking_for, interests, photo_url }
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, location, num_kids, kids_ages, kids_genders, looking_for, interests, photo_url } = req.body;

    // Verify user is updating their own profile
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update user base info
    if (bio || location) {
      const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update({
          bio: bio || undefined,
          location: location || undefined,
          updated_at: new Date(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (userError) throw userError;
    }

    // Update or create extended profile
    const profileData = {
      user_id: userId,
      num_kids: num_kids || null,
      kids_ages: kids_ages || null,
      kids_genders: kids_genders || null,
      looking_for: looking_for || null,
      interests: interests || null,
      photo_url: photo_url || null,
      updated_at: new Date(),
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (profileError) throw profileError;

    res.json({
      message: 'Profile updated',
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Upload selfie for verification
 * POST /api/profiles/:userId/selfie
 * Body: { selfie_url } (base64 or URL)
 */
export const uploadSelfie = async (req, res) => {
  try {
    const { userId } = req.params;
    const { selfie_url } = req.body;

    // Verify user is uploading their own selfie
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!selfie_url) {
      return res.status(400).json({ error: 'Selfie URL is required' });
    }

    // Update user selfie
    const { data: user, error } = await supabase
      .from('users')
      .update({
        selfie_url,
        // In production, set to pending verification
        // verified: 'pending',
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Selfie uploaded',
      user: {
        id: user.id,
        selfie_url: user.selfie_url,
      },
    });
  } catch (error) {
    console.error('Upload selfie error:', error);
    res.status(500).json({ error: 'Failed to upload selfie' });
  }
};

/**
 * Upload a photo to the gallery
 * POST /api/profiles/:userId/photos
 * multipart/form-data: file field = "photo"
 */
export const uploadPhoto = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    // Get current profile to check photo count
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('photo_urls')
      .eq('user_id', userId)
      .single();

    // PGRST116 = no row yet, that's fine
    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    const currentPhotos = profile?.photo_urls || [];
    if (currentPhotos.length >= 5) {
      return res.status(400).json({ error: 'Maximum of 5 photos allowed. Delete one first.' });
    }

    // Build storage path
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `profiles/${userId}/photos/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(storagePath);

    const photoUrl = urlData.publicUrl;
    const updatedPhotos = [...currentPhotos, photoUrl];

    // Upsert profile with new photo array
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert(
        { user_id: userId, photo_urls: updatedPhotos, updated_at: new Date() },
        { onConflict: 'user_id' }
      );

    if (updateError) throw updateError;

    res.json({
      message: 'Photo uploaded',
      photo_url: photoUrl,
      photo_urls: updatedPhotos,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload photo' });
  }
};

/**
 * Delete a photo from the gallery
 * DELETE /api/profiles/:userId/photos/:photoIndex
 */
export const deletePhoto = async (req, res) => {
  try {
    const { userId, photoIndex } = req.params;
    const index = parseInt(photoIndex, 10);

    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (isNaN(index) || index < 0) {
      return res.status(400).json({ error: 'Invalid photo index' });
    }

    // Get current photos
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('photo_urls')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    const currentPhotos = profile?.photo_urls || [];
    if (index >= currentPhotos.length) {
      return res.status(404).json({ error: 'Photo not found at that index' });
    }

    const photoUrl = currentPhotos[index];

    // Extract the storage path from the URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/profiles/<path>
    const storagePathMatch = photoUrl.match(/\/object\/public\/profiles\/(.+)$/);
    if (storagePathMatch) {
      const storagePath = storagePathMatch[1];
      await supabase.storage.from('profiles').remove([storagePath]);
      // Ignore storage errors (file may already be gone)
    }

    // Remove from array
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_urls: updatedPhotos, updated_at: new Date() })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    res.json({
      message: 'Photo deleted',
      photo_urls: updatedPhotos,
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete photo' });
  }
};

/**
 * Reorder photos
 * PUT /api/profiles/:userId/photos/reorder
 * Body: { photo_urls: string[] } — full reordered array
 */
export const reorderPhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { photo_urls } = req.body;

    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!Array.isArray(photo_urls)) {
      return res.status(400).json({ error: 'photo_urls must be an array' });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ photo_urls, updated_at: new Date() })
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Photos reordered', photo_urls });
  } catch (error) {
    console.error('Reorder photos error:', error);
    res.status(500).json({ error: 'Failed to reorder photos' });
  }
};
