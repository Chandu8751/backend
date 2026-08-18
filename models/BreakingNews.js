const mongoose = require('mongoose');

const breakingNewsSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BreakingNews', breakingNewsSchema);
