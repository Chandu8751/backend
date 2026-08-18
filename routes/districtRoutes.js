const express = require('express');
const router = express.Router();
const {
  getDistricts,
  getDistrictBySlug,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} = require('../controllers/districtController');
const { protect, authorize } = require('../middleware/auth');

const ADMIN = ['admin'];

router.get('/', getDistricts);
router.get('/:slug', getDistrictBySlug);
router.post('/', protect, authorize(...ADMIN), createDistrict);
router.put('/:id', protect, authorize(...ADMIN), updateDistrict);
router.delete('/:id', protect, authorize(...ADMIN), deleteDistrict);

module.exports = router;
