const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLike,
  addComment,
  getMyArticles,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const STAFF = ['admin', 'reporter'];

// Public reads first (optional-auth handled inside controller via req.user)
router.get('/', (req, res, next) => {
  // Attempt to attach req.user if a token is present, without requiring it.
  const auth = req.headers.authorization;
  if (!auth) return next();
  return protect(req, res, next);
}, getArticles);

router.get('/mine', protect, authorize(...STAFF), getMyArticles);
router.get('/:slug', getArticleBySlug);

router.post('/', protect, authorize(...STAFF), upload.single('featuredImage'), createArticle);
router.put('/:id', protect, authorize(...STAFF), upload.single('featuredImage'), updateArticle);
router.delete('/:id', protect, authorize(...STAFF), deleteArticle);

router.put('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);

module.exports = router;
