const mongoose = require('mongoose');
const slugify = require('slugify');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    reported: { type: Boolean, default: false },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const articleSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    slug: { type: String, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    featuredImage: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    gallery: [{ type: String }],
    description: { type: String, required: true },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

articleSchema.index({ headline: 'text', description: 'text', tags: 'text' });

articleSchema.pre('validate', function (next) {
  if (this.headline && !this.slug) {
    this.slug = slugify(this.headline, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

articleSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);
