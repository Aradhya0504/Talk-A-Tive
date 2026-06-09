require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fakeUsers = [
  { username: 'alex_rivera',   email: 'alex@talktive.com',   password: 'password123' },
  { username: 'priya_sharma',  email: 'priya@talktive.com',  password: 'password123' },
  { username: 'jordan_lee',    email: 'jordan@talktive.com', password: 'password123' },
  { username: 'sofia_martin',  email: 'sofia@talktive.com',  password: 'password123' },
  { username: 'noah_chen',     email: 'noah@talktive.com',   password: 'password123' },
  { username: 'aisha_khan',    email: 'aisha@talktive.com',  password: 'password123' },
  { username: 'liam_torres',   email: 'liam@talktive.com',   password: 'password123' },
  { username: 'zara_patel',    email: 'zara@talktive.com',   password: 'password123' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let created = 0;
  let skipped = 0;

  for (const u of fakeUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) { console.log(`  skipped  — ${u.username} (already exists)`); skipped++; continue; }
    await User.create(u);
    console.log(`  created  — ${u.username}`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
  console.log('All passwords are: password123');
  process.exit(0);
};

seed().catch((e) => { console.error(e.message); process.exit(1); });
