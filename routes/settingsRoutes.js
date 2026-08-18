const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const ADMIN = ['admin'];

router.get('/', getSettings);
router.put('/', protect, authorize(...ADMIN), upload.single('logo'), updateSettings);

module.exports = router;
