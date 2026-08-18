const District = require('../models/District');
const Article = require('../models/Article');
const Reporter = require('../models/Reporter');

exports.getDistricts = async (req, res, next) => {
  try {
    const districts = await District.find().sort('name');
    res.json({ success: true, count: districts.length, districts });
  } catch (err) {
    next(err);
  }
};

exports.getDistrictBySlug = async (req, res, next) => {
  try {
    const district = await District.findOne({ slug: req.params.slug });
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });

    const [articles, reporters] = await Promise.all([
      Article.find({ district: district._id, status: 'published' })
        .populate('category', 'name slug')
        .populate('author', 'name')
        .sort('-publishedAt')
        .limit(20),
      Reporter.find({ district: district._id }),
    ]);

    res.json({ success: true, district, articles, reporters });
  } catch (err) {
    next(err);
  }
};

exports.createDistrict = async (req, res, next) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json({ success: true, district });
  } catch (err) {
    next(err);
  }
};

exports.updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, district });
  } catch (err) {
    next(err);
  }
};

exports.deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, message: 'District deleted' });
  } catch (err) {
    next(err);
  }
};
