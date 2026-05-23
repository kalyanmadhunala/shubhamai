import cloudinary from '../config/cloudinary.js';

// ─────────────────────────────────────────────────────────────────────────────
// Upload a base64 image or URL to Cloudinary
// Returns: { cloudinaryId, imageUrl, width, height }
// ─────────────────────────────────────────────────────────────────────────────
export const uploadPoster = async ({ imageData, userId, eventName }) => {
  // imageData can be a base64 data URI or a URL
  const publicId = `shubhamai/posters/${userId}/${Date.now()}`;

  const uploadOptions = {
    public_id: publicId,
    folder: 'shubhamai/posters',
    resource_type: 'image',
    quality: 'auto:best',
    fetch_format: 'auto',
    tags: ['poster', userId, eventName?.toLowerCase().replace(/\s/g, '_') || 'custom'],
    context: {
      user_id: userId,
      event_name: eventName || 'Custom Poster',
      uploaded_at: new Date().toISOString(),
    },
  };

  const result = await cloudinary.uploader.upload(imageData, uploadOptions);

  return {
    cloudinaryId: result.public_id,
    imageUrl: result.secure_url,
    width: result.width,
    height: result.height,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete a poster from Cloudinary
// ─────────────────────────────────────────────────────────────────────────────
export const deletePoster = async (cloudinaryId) => {
  const result = await cloudinary.uploader.destroy(cloudinaryId);
  return result.result === 'ok';
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload a reference image (used in custom poster generation)
// ─────────────────────────────────────────────────────────────────────────────
export const uploadReferenceImage = async ({ imageData, userId }) => {
  const result = await cloudinary.uploader.upload(imageData, {
    folder: 'shubhamai/references',
    resource_type: 'image',
    quality: 'auto:good',
    tags: ['reference', userId],
  });

  return {
    cloudinaryId: result.public_id,
    imageUrl: result.secure_url,
  };
};

export default { uploadPoster, deletePoster, uploadReferenceImage };