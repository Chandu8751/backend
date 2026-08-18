const User = require('../models/User');

// @route GET /api/users (admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users (admin only) — this is how staff accounts (admin/reporter) get
// created. Public self-registration (POST /api/auth/register) always forces role
// 'viewer'; only an existing admin can grant elevated roles, and only from here.
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with that email already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: ['admin', 'reporter', 'viewer'].includes(role) ? role : 'reporter',
    });
    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/:id (admin only) — change role/name/active status, or reset password
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Guard rail: don't let the last admin demote or deactivate themselves and leave
    // nobody able to manage the site.
    const isSelf = String(user._id) === String(req.user._id);
    if (isSelf && (role || isActive === false)) {
      const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: user._id } });
      if (otherAdmins === 0 && (role !== 'admin')) {
        return res.status(400).json({
          success: false,
          message: 'You are the only admin — promote another user to admin before changing your own role or deactivating yourself.',
        });
      }
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined && ['admin', 'reporter', 'viewer'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = password; // pre-save hook hashes this
    }
    await user.save();

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/users/:id (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You can't delete your own account while logged in as it." });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: user._id } });
      if (otherAdmins === 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete the only remaining admin.' });
      }
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
