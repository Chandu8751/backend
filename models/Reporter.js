const mongoose = require('mongoose');

const reporterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    designation: { type: String, default: 'Reporter' },
    photo: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    biography: { type: String, default: '' },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    isLive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reporterSchema.virtual('articlesPublished', {
  ref: 'Article',
  localField: 'user',
  foreignField: 'author',
  count: true,
});
reporterSchema.set('toJSON', { virtuals: true });
reporterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reporter', reporterSchema);
