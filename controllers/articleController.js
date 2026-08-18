const Article = require('../models/Article');
const { getFileUrl } = require('../middleware/upload');

const populateOpts = [
  { path: 'category', select: 'name slug' },
  { path: 'district', select: 'name slug' },
  { path: 'author', select: 'name role' },
];

// @route GET /api/articles
// Query params: category, district, status, featured, search, page, limit
exports.getArticles = async (req, res, next) => {
  try {
    const { category, district, status, featured, search, page = 1, limit = 12 } = req.query;
    const filter = {};

    // Public callers only ever see published articles; only authenticated staff can filter by status.
    if (req.user && status) {
      filter.status = status;
    } else {
      filter.status = 'published';
    }

    if (category) filter.category = category;
    if (district) filter.district = district;
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate(populateOpts)
        .sort('-publishedAt -createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: articles.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      articles,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/articles/:slug
exports.getArticleBySlug = async (req, res, next) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate(populateOpts)
      .populate('comments.user', 'name avatar');

    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const related = await Article.find({
      category: article.category,
      _id: { $ne: article._id },
      status: 'published',
    })
      .limit(4)
      .select('headline slug featuredImage publishedAt');

    res.json({ success: true, article, related });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/articles (reporter+)
exports.createArticle = async (req, res, next) => {
  try {
    const payload = { ...req.body, author: req.user._id };
    if (req.file) payload.featuredImage = getFileUrl(req.file);
    const article = await Article.create(payload);
    res.status(201).json({ success: true, article });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/articles/:id (author or editor+)
exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const isOwner = article.author.toString() === req.user._id.toString();
    const isElevated = ['admin'].includes(req.user.role);
    if (!isOwner && !isElevated) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this article' });
    }

    const updates = { ...req.body };
    if (req.file) updates.featuredImage = getFileUrl(req.file);

    Object.assign(article, updates);
    await article.save();
    res.json({ success: true, article });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/articles/:id
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const isOwner = article.author.toString() === req.user._id.toString();
    const isElevated = ['admin'].includes(req.user.role);
    if (!isOwner && !isElevated) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this article' });
    }

    await article.deleteOne();
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/articles/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const idx = article.likes.findIndex((u) => u.toString() === req.user._id.toString());
    if (idx > -1) article.likes.splice(idx, 1);
    else article.likes.push(req.user._id);

    await article.save();
    res.json({ success: true, likesCount: article.likes.length });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/articles/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text required' });

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    article.comments.push({ user: req.user._id, text });
    await article.save();
    res.status(201).json({ success: true, comments: article.comments });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/articles/mine (reporter's own articles)
exports.getMyArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ author: req.user._id })
      .populate(populateOpts)
      .sort('-createdAt');
    res.json({ success: true, count: articles.length, articles });
  } catch (err) {
    next(err);
  }
};
