const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const STAFF = ['admin', 'reporter'];

router.post('/', protect, authorize(...STAFF), upload.single('file'), uploadSingle);
router.post('/gallery', protect, authorize(...STAFF), upload.array('files', 20), uploadMultiple);

module.exports = router;
