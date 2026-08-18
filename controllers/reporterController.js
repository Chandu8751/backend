const Reporter = require('../models/Reporter');
const { getFileUrl } = require('../middleware/upload');

exports.getReporters = async (req, res, next) => {
  try {
    const { district } = req.query;
    const filter = {};
    if (district) filter.district = district;
    const reporters = await Reporter.find(filter).populate('district', 'name slug');
    res.json({ success: true, count: reporters.length, reporters });
  } catch (err) {
    next(err);
  }
};

exports.getReporterById = async (req, res, next) => {
  try {
    const reporter = await Reporter.findById(req.params.id).populate('district', 'name slug');
    if (!reporter) return res.status(404).json({ success: false, message: 'Reporter not found' });
    res.json({ success: true, reporter });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/reporters (admin/editor only - links a Reporter profile to an existing User)
exports.createReporter = async (req, res, next) => {
  try {
    const reporter = await Reporter.create(req.body);
    res.status(201).json({ success: true, reporter });
  } catch (err) {
    next(err);
  }
};

exports.updateReporter = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.photo = getFileUrl(req.file);
    const reporter = await Reporter.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!reporter) return res.status(404).json({ success: false, message: 'Reporter not found' });
    res.json({ success: true, reporter });
  } catch (err) {
    next(err);
  }
};

exports.deleteReporter = async (req, res, next) => {
  try {
    const reporter = await Reporter.findByIdAndDelete(req.params.id);
    if (!reporter) return res.status(404).json({ success: false, message: 'Reporter not found' });
    res.json({ success: true, message: 'Reporter deleted' });
  } catch (err) {
    next(err);
  }
};
