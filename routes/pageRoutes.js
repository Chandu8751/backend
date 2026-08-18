const express = require('express');
const router = express.Router();
const { getAllPages, getPage, updatePage } = require('../controllers/pageController');
const { protect, authorize } = require('../middleware/auth');

const ADMIN = ['admin'];

router.get('/', protect, authorize(...ADMIN), getAllPages);
router.get('/:slug', getPage);
router.put('/:slug', protect, authorize(...ADMIN), updatePage);

module.exports = router;
