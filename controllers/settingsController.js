const Settings = require('../models/Settings');
const { getFileUrl } = require('../middleware/upload');

// @route GET /api/settings (public - powers logo/name/social links across the site)
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/settings (admin only)
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();

    const { siteName, shortName, tagline, social, contact, liveTv, removeLogo } = req.body;
    if (siteName !== undefined) settings.siteName = siteName;
    if (shortName !== undefined) settings.shortName = shortName;
    if (tagline !== undefined) settings.tagline = tagline;

    // social/contact/liveTv may arrive as nested JSON (fetch/axios) or as a JSON string (multipart form)
    const parsedSocial = typeof social === 'string' ? JSON.parse(social) : social;
    const parsedContact = typeof contact === 'string' ? JSON.parse(contact) : contact;
    const parsedLiveTv = typeof liveTv === 'string' ? JSON.parse(liveTv) : liveTv;
    if (parsedSocial) settings.social = { ...settings.social.toObject(), ...parsedSocial };
    if (parsedContact) settings.contact = { ...settings.contact.toObject(), ...parsedContact };
    if (parsedLiveTv) settings.liveTv = { ...settings.liveTv.toObject(), ...parsedLiveTv };

    if (req.file) {
      settings.logoUrl = getFileUrl(req.file);
    } else if (removeLogo === 'true' || removeLogo === true) {
      settings.logoUrl = '';
    }

    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};
