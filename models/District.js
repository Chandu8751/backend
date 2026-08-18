const mongoose = require('mongoose');
const slugify = require('slugify');

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    state: { type: String, default: 'Andhra Pradesh' },
    description: { type: String, default: '' },
    weatherInfo: { type: String, default: '' },
    emergencyAlert: { type: String, default: '' },
  },
  { timestamps: true }
);

districtSchema.pre('validate', function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('District', districtSchema);
