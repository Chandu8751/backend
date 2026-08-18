const express = require('express');
const router = express.Router();
const {
  getReporters,
  getReporterById,
  createReporter,
  updateReporter,
  deleteReporter,
} = require('../controllers/reporterController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const ADMIN = ['admin'];

router.get('/', getReporters);
router.get('/:id', getReporterById);
router.post('/', protect, authorize(...ADMIN), createReporter);
router.put('/:id', protect, authorize(...ADMIN), upload.single('photo'), updateReporter);
router.delete('/:id', protect, authorize(...ADMIN), deleteReporter);

module.exports = router;
