const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// SÉCURITÉ : T'avertit dans les logs Render si les clés sont mal lues
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn("⚠️ Attention : Variables Cloudinary non détectées par le serveur.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'calsed_uploads', // Dossier sur Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optimisation sans perte
  },
});

module.exports = { cloudinary, storage };