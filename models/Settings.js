const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Local News Network' },
    shortName: { type: String, default: 'LNN' }, // shown in the badge when there's no logo image
    tagline: { type: String, default: 'Nandyal & Rayalaseema' },
    logoUrl: { type: String, default: '' }, // if set, shown instead of the shortName badge
    favicon: { type: String, default: '' },
    social: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    contact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    liveTv: {
      streamUrl: { type: String, default: '' }, // full iframe embed URL (YouTube/Facebook/HLS player)
      note: { type: String, default: '' }, // shown under the player, e.g. broadcast schedule
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// This collection only ever holds a single document. getSingleton() creates it
// on first access so the API and frontend never have to special-case "no settings yet".
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
