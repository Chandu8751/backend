const express = require('express');
const router = express.Router();
const {
  getBreakingNews,
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  togglePin,
  deleteBreakingNews,
} = require('../controllers/breakingNewsController');
const { protect, authorize } = require('../middleware/auth');

const ADMIN = ['admin'];

router.get('/', getBreakingNews);
router.get('/all', protect, authorize(...ADMIN), getAllBreakingNews);
router.post('/', protect, authorize(...ADMIN), createBreakingNews);
router.put('/:id', protect, authorize(...ADMIN), updateBreakingNews);
router.put('/:id/pin', protect, authorize(...ADMIN), togglePin);
router.delete('/:id', protect, authorize(...ADMIN), deleteBreakingNews);

module.exports = router;
