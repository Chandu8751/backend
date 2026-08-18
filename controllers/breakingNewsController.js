const BreakingNews = require('../models/BreakingNews');

// @route GET /api/breaking-news  (public - active items only, pinned first)
// The frontend polls this every ~20s to keep the ticker fresh — no websockets needed,
// which keeps this deployable on free/serverless hosts that don't support long-lived
// socket connections well.
exports.getBreakingNews = async (req, res, next) => {
  try {
    const items = await BreakingNews.find({ isActive: true }).sort('-isPinned -createdAt');
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/breaking-news/all (admin - everything, incl. inactive)
exports.getAllBreakingNews = async (req, res, next) => {
  try {
    const items = await BreakingNews.find().populate('createdBy', 'name').sort('-createdAt');
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/breaking-news
exports.createBreakingNews = async (req, res, next) => {
  try {
    const item = await BreakingNews.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/breaking-news/:id
exports.updateBreakingNews = async (req, res, next) => {
  try {
    const item = await BreakingNews.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Breaking news item not found' });
    res.json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/breaking-news/:id/pin
exports.togglePin = async (req, res, next) => {
  try {
    const item = await BreakingNews.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Breaking news item not found' });
    item.isPinned = !item.isPinned;
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/breaking-news/:id
exports.deleteBreakingNews = async (req, res, next) => {
  try {
    const item = await BreakingNews.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Breaking news item not found' });
    res.json({ success: true, message: 'Breaking news deleted' });
  } catch (err) {
    next(err);
  }
};
