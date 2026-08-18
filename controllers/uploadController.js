// Generic file upload endpoint. Uses Cloudinary automatically when CLOUDINARY_* env
// vars are set (see middleware/upload.js), falling back to local disk storage for
// development. The response shape is identical either way.
const { getFileUrl } = require('../middleware/upload');

// @route POST /api/uploads  (single file, field name "file")
exports.uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.status(201).json({
      success: true,
      url: getFileUrl(req.file),
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/uploads/gallery (multiple files, field name "files")
exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const urls = req.files.map((f) => getFileUrl(f));
    res.status(201).json({ success: true, urls });
  } catch (err) {
    next(err);
  }
};
