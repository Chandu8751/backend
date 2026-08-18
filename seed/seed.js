// Populates the database with a super admin, categories, districts, reporters,
// a few articles, and breaking news items so the site isn't empty on first run.
//
// Run with: npm run seed   (make sure MONGO_URI is set in backend/.env)

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const District = require('../models/District');
const Reporter = require('../models/Reporter');
const Article = require('../models/Article');
const BreakingNews = require('../models/BreakingNews');
const Settings = require('../models/Settings');
const Page = require('../models/Page');

const run = async () => {
  await connectDB();
  console.log('Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    District.deleteMany({}),
    Reporter.deleteMany({}),
    Article.deleteMany({}),
    BreakingNews.deleteMany({}),
    Settings.deleteMany({}),
    Page.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@lnn.local',
    password: 'Admin@123',
    role: 'admin',
  });

  const reporterUser = await User.create({
    name: 'Ramesh Kumar',
    email: 'reporter@lnn.local',
    password: 'Reporter@123',
    role: 'reporter',
  });

  const categoryNames = [
    'Politics', 'Crime', 'Sports', 'Business', 'Education', 'Technology',
    'Weather', 'Entertainment', 'Health', 'Agriculture', 'Government Schemes',
    'Jobs', 'Local News', 'Village News', 'Temple News', 'Festival News',
    'Traffic Updates', 'Emergency Alerts',
  ];
  const categories = await Category.insertMany(categoryNames.map((name) => ({ name })));

  const districtNames = ['Nandyal', 'Kurnool', 'Anantapur', 'Kadapa', 'Chittoor'];
  const districts = await District.insertMany(
    districtNames.map((name) => ({ name, state: 'Andhra Pradesh' }))
  );

  const reporter = await Reporter.create({
    user: reporterUser._id,
    name: reporterUser.name,
    designation: 'Senior Reporter',
    phone: '+91 90000 00000',
    email: reporterUser.email,
    district: districts[0]._id,
    biography: 'Covering Nandyal district news for over 8 years.',
    social: { facebook: '', instagram: '', twitter: '', youtube: '' },
    isLive: true,
  });

  const findCat = (name) => categories.find((c) => c.name === name)._id;

  const sampleArticles = [
    {
      headline: 'Nandyal District Collector Launches New Irrigation Project',
      subtitle: 'Project expected to benefit over 10,000 farmers',
      category: findCat('Government Schemes'),
      district: districts[0]._id,
      description:
        'The district collector today launched a new irrigation project aimed at improving water access for farmers across Nandyal. Officials say the project will be completed within 18 months and will directly benefit more than 10,000 farming families in the region.',
      isFeatured: true,
      status: 'published',
      tags: ['irrigation', 'nandyal', 'agriculture'],
    },
    {
      headline: 'Local Cricket Tournament Kicks Off in Kurnool',
      subtitle: 'Sixteen teams compete for the district championship',
      category: findCat('Sports'),
      district: districts[1]._id,
      description:
        'The annual district cricket tournament began this week in Kurnool with sixteen teams from surrounding villages competing for the championship trophy. The final is scheduled for later this month.',
      isFeatured: true,
      status: 'published',
      tags: ['cricket', 'kurnool', 'sports'],
    },
    {
      headline: 'Heavy Rainfall Expected Across Rayalaseema Districts',
      subtitle: 'Weather department issues yellow alert',
      category: findCat('Weather'),
      district: districts[2]._id,
      description:
        'The regional weather department has issued a yellow alert for heavy rainfall expected across Rayalaseema districts over the next 48 hours. Residents in low-lying areas are advised to stay alert.',
      isFeatured: false,
      status: 'published',
      tags: ['weather', 'rain', 'alert'],
    },
    {
      headline: 'New Government Job Notifications Released for Graduates',
      subtitle: 'Applications open from next week',
      category: findCat('Jobs'),
      district: districts[3]._id,
      description:
        'The state government has released new job notifications for graduate-level positions across several departments. Interested candidates can apply online starting next week.',
      isFeatured: false,
      status: 'published',
      tags: ['jobs', 'government', 'graduates'],
    },
  ];

  for (const data of sampleArticles) {
    await Article.create({ ...data, author: reporter.user, publishedAt: new Date() });
  }

  await BreakingNews.insertMany([
    { text: 'Nandyal irrigation project launched by district collector', isPinned: true, createdBy: admin._id },
    { text: 'Heavy rain alert issued for Rayalaseema districts', isPinned: false, createdBy: admin._id },
    { text: 'District cricket tournament finals scheduled for next week', isPinned: false, createdBy: admin._id },
  ]);

  await Settings.create({
    siteName: 'Local News Network',
    shortName: 'LNN',
    tagline: 'Nandyal & Rayalaseema',
    social: {
      facebook: 'https://facebook.com/lnnnews',
      twitter: 'https://twitter.com/lnnnews',
      youtube: 'https://youtube.com/@lnnnews',
      instagram: 'https://instagram.com/lnnnews',
    },
    contact: {
      phone: '+91 90000 00000',
      email: 'newsdesk@lnn.local',
      address: 'Main Road, Nandyal, Andhra Pradesh, 518501',
    },
    liveTv: {
      streamUrl: '',
      note: 'Set your YouTube Live / Facebook Live / HLS embed URL from Admin → Settings.',
    },
    updatedBy: admin._id,
  });

  // Seed the 5 static content pages (About, Advertise, Privacy, Terms, Careers) with
  // their default copy so the site never shows an empty page — editable any time from
  // Admin → Pages.
  await Page.insertMany(
    Object.entries(Page.DEFAULTS).map(([slug, { title, content }]) => ({
      slug,
      title,
      content,
      updatedBy: admin._id,
    }))
  );

  console.log('Seed complete.');
  console.log('Admin login     -> email: admin@lnn.local     password: Admin@123');
  console.log('Reporter login  -> email: reporter@lnn.local  password: Reporter@123');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
