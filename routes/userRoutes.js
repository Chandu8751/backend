const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const ADMIN = ['admin'];

router.get('/', protect, authorize(...ADMIN), getUsers);
router.post('/', protect, authorize(...ADMIN), createUser);
router.put('/:id', protect, authorize(...ADMIN), updateUser);
router.delete('/:id', protect, authorize(...ADMIN), deleteUser);

module.exports = router;
