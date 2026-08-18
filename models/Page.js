const mongoose = require('mongoose');

// Simple CMS for the site's static pages (About, Advertise, Privacy Policy, Terms,
// Careers). `slug` identifies which page this is; `content` is plain text with blank
// lines between paragraphs (rendered with white-space:pre-line on the frontend — no
// rich text editor needed to keep this simple).
const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ['about', 'advertise', 'privacy', 'terms', 'careers'],
    },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const DEFAULTS = {
  about: {
    title: 'About Us',
    content:
      'Local News Network (LNN) delivers fast, accurate news from Nandyal and the surrounding Rayalaseema districts — covering politics, crime, sports, agriculture, government schemes, and everyday life in villages and towns across the region.\n\nOur mission is simple: bring credible local reporting to people who won\'t find it on national channels, in the language they read most comfortably.\n\nEdit this page any time from Admin → Pages.',
  },
  advertise: {
    title: 'Advertise With Us',
    content:
      'Reach a local, engaged audience across Nandyal and the Rayalaseema districts. We offer banner placements, sponsored articles, and video ad slots.\n\nContact our sales desk using the details on the Contact page to discuss rates and packages.\n\nEdit this page any time from Admin → Pages.',
  },
  privacy: {
    title: 'Privacy Policy',
    content:
      'This is a placeholder privacy policy. Replace this with your organization\'s actual policy before launch — cover what data you collect (e.g. comments, likes, account info), how it\'s used, and how people can request deletion.\n\nEdit this page any time from Admin → Pages.',
  },
  terms: {
    title: 'Terms of Use',
    content:
      'This is a placeholder terms of use page. Replace this with your organization\'s actual terms before launch.\n\nEdit this page any time from Admin → Pages.',
  },
  careers: {
    title: 'Careers',
    content:
      'We\'re always looking for local reporters and contributors across our coverage districts. If you\'re interested in joining our newsroom, reach out via the Contact page.\n\nEdit this page any time from Admin → Pages.',
  },
};

// Ensures a Page document exists for every known slug — called from GET /api/pages/:slug
// so the site never 404s on a page that hasn't been edited yet.
pageSchema.statics.getOrCreate = async function (slug) {
  let page = await this.findOne({ slug });
  if (!page) {
    const fallback = DEFAULTS[slug];
    if (!fallback) return null;
    page = await this.create({ slug, ...fallback });
  }
  return page;
};

pageSchema.statics.DEFAULTS = DEFAULTS;

module.exports = mongoose.model('Page', pageSchema);
