const Page = require('../models/Page');

const VALID_SLUGS = ['about', 'advertise', 'privacy', 'terms', 'careers'];

// @route GET /api/pages  (admin - list all 5, creating defaults for any not yet edited)
exports.getAllPages = async (req, res, next) => {
  try {
    const pages = await Promise.all(VALID_SLUGS.map((slug) => Page.getOrCreate(slug)));
    res.json({ success: true, pages });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/pages/:slug  (public)
exports.getPage = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!VALID_SLUGS.includes(slug)) {
      return res.status(404).json({ success: false, message: 'Unknown page' });
    }
    const page = await Page.getOrCreate(slug);
    res.json({ success: true, page });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/pages/:slug  (admin only)
exports.updatePage = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!VALID_SLUGS.includes(slug)) {
      return res.status(404).json({ success: false, message: 'Unknown page' });
    }
    const { title, content } = req.body;
    const page = await Page.findOneAndUpdate(
      { slug },
      { title, content, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, page });
  } catch (err) {
    next(err);
  }
};
