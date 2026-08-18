const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Two storage backends, chosen automatically:
//
// 1. Cloudinary (used whenever CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET are set) —
//    files stream straight to Cloudinary's free tier and a permanent CDN URL is stored.
//    This is the option that actually works on free hosts like Render/Railway/Vercel,
//    whose filesystems are wiped on every restart/deploy.
// 2. Local disk (fallback when Cloudinary isn't configured) — fine for local
//    development, but only reliable in production on a host with persistent disk.
const hasCloudinary =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

const maxSize = (parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 10) * 1024 * 1024;
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|mp4|mov|webm/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Unsupported file type'));
};

let storage;

if (hasCloudinary) {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // A minimal multer storage engine that streams the upload straight to Cloudinary.
  // (We hand-roll this instead of pulling in multer-storage-cloudinary, which only
  // supports the old Cloudinary v1 SDK — one fewer dependency to keep this simple.)
  storage = {
    _handleFile(req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'lnn', resource_type: 'auto' },
        (err, result) => {
          if (err) return cb(err);
          cb(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
        }
      );
      file.stream.pipe(uploadStream);
    },
    _removeFile(req, file, cb) {
      cb(null);
    },
  };
} else {
  const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });
}

const upload = multer({ storage, fileFilter, limits: { fileSize: maxSize } });

// Controllers call this instead of building the URL themselves, so they work the same
// way regardless of which storage backend is active. Our Cloudinary engine puts the
// final CDN URL in `file.path`; local disk storage only gives us a filename, so we
// build the `/uploads/...` path ourselves.
function getFileUrl(file) {
  if (!file) return null;
  return hasCloudinary ? file.path : `/uploads/${file.filename}`;
}

module.exports = upload;
module.exports.getFileUrl = getFileUrl;
module.exports.hasCloudinary = hasCloudinary;
