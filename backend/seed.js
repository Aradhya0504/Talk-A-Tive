require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

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

const dmConversations = [
  {
    userA: 'alex_rivera', userB: 'priya_sharma',
    messages: [
      { from: 'priya_sharma', text: 'Hey Alex! How are you doing?' },
      { from: 'alex_rivera',  text: 'Hey Priya! I\'m great, just got back from a run 🏃' },
      { from: 'priya_sharma', text: 'Nice! I\'ve been meaning to start working out too 😅' },
      { from: 'alex_rivera',  text: 'You should! It\'s been amazing for clearing my head' },
      { from: 'priya_sharma', text: 'Maybe we can go together sometime?' },
      { from: 'alex_rivera',  text: 'Absolutely, let\'s plan for the weekend!' },
    ],
  },
  {
    userA: 'jordan_lee', userB: 'sofia_martin',
    messages: [
      { from: 'jordan_lee',  text: 'Sofia did you finish the project?' },
      { from: 'sofia_martin', text: 'Almost! Just need to fix a few bugs 🐛' },
      { from: 'jordan_lee',  text: 'Let me know if you need help' },
      { from: 'sofia_martin', text: 'Thanks Jordan, you\'re a lifesaver!' },
      { from: 'jordan_lee',  text: 'No worries, that\'s what teammates are for 😄' },
    ],
  },
  {
    userA: 'noah_chen', userB: 'aisha_khan',
    messages: [
      { from: 'aisha_khan', text: 'Noah, did you watch the game last night?' },
      { from: 'noah_chen',  text: 'Yes!! What a match 🔥' },
      { from: 'aisha_khan', text: 'That last-minute goal was insane!' },
      { from: 'noah_chen',  text: 'I literally screamed haha' },
      { from: 'aisha_khan', text: 'Same 😂 we should watch the next one together' },
      { from: 'noah_chen',  text: 'Definitely! My place next time?' },
      { from: 'aisha_khan', text: 'Deal! 🙌' },
    ],
  },
  {
    userA: 'liam_torres', userB: 'zara_patel',
    messages: [
      { from: 'zara_patel',  text: 'Liam, I tried that restaurant you recommended!' },
      { from: 'liam_torres', text: 'Oh nice! What did you think?' },
      { from: 'zara_patel',  text: 'The food was absolutely amazing 😍' },
      { from: 'liam_torres', text: 'Right?! Their pasta is unreal' },
      { from: 'zara_patel',  text: 'I\'m already planning to go back this weekend' },
      { from: 'liam_torres', text: 'Mind if I join? 😄' },
      { from: 'zara_patel',  text: 'Of course! The more the merrier 🍝' },
    ],
  },
  {
    userA: 'alex_rivera', userB: 'noah_chen',
    messages: [
      { from: 'alex_rivera', text: 'Noah, are you coming to the meetup tomorrow?' },
      { from: 'noah_chen',   text: 'I was planning to, what time does it start?' },
      { from: 'alex_rivera', text: 'Around 6pm at the usual spot' },
      { from: 'noah_chen',   text: 'Perfect, I\'ll be there 👍' },
      { from: 'alex_rivera', text: 'Great! Should be a fun evening' },
    ],
  },
  {
    userA: 'priya_sharma', userB: 'zara_patel',
    messages: [
      { from: 'priya_sharma', text: 'Zara, have you seen the new design mockups?' },
      { from: 'zara_patel',   text: 'Yes! They look stunning 😍' },
      { from: 'priya_sharma', text: 'I know right, the color palette is perfect' },
      { from: 'zara_patel',   text: 'I especially love the new dashboard layout' },
      { from: 'priya_sharma', text: 'Same! I think the users are going to love it' },
    ],
  },
];

const groupConversations = [
  {
    name: 'Dev Squad 🚀',
    members: ['alex_rivera', 'jordan_lee', 'noah_chen', 'sofia_martin'],
    admin: 'alex_rivera',
    messages: [
      { from: 'alex_rivera',  text: 'Hey team! Welcome to the dev squad chat 🚀' },
      { from: 'jordan_lee',   text: 'Finally we have a group chat!' },
      { from: 'noah_chen',    text: 'This is going to make collaboration so much easier' },
      { from: 'sofia_martin', text: 'Agreed! Should we do a standup here every morning?' },
      { from: 'alex_rivera',  text: 'Great idea Sofia! Let\'s start tomorrow' },
      { from: 'jordan_lee',   text: 'I\'m in 💪' },
      { from: 'noah_chen',    text: 'Same, see everyone tomorrow!' },
    ],
  },
  {
    name: 'Weekend Vibes 🎉',
    members: ['priya_sharma', 'aisha_khan', 'liam_torres', 'zara_patel', 'sofia_martin'],
    admin: 'priya_sharma',
    messages: [
      { from: 'priya_sharma', text: 'Who\'s free this weekend? 🙋' },
      { from: 'aisha_khan',   text: 'I am! What\'s the plan?' },
      { from: 'liam_torres',  text: 'Count me in 🙌' },
      { from: 'zara_patel',   text: 'Me too! What are we thinking?' },
      { from: 'priya_sharma', text: 'How about a picnic in the park on Saturday?' },
      { from: 'sofia_martin', text: 'That sounds amazing! 🌞' },
      { from: 'aisha_khan',   text: 'I\'ll bring snacks!' },
      { from: 'liam_torres',  text: 'I\'ll bring drinks 🥤' },
      { from: 'zara_patel',   text: 'Can\'t wait, this is going to be so fun 😄' },
    ],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // ── Users ──────────────────────────────────────────────────────────────────
  let createdUsers = 0, skippedUsers = 0;
  for (const u of fakeUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) { console.log(`  skipped  — ${u.username} (already exists)`); skippedUsers++; continue; }
    await User.create(u);
    console.log(`  created  — ${u.username}`);
    createdUsers++;
  }
  console.log(`\nUsers: ${createdUsers} created, ${skippedUsers} skipped.\n`);

  // load all seeded users into a map
  const userMap = {};
  for (const u of fakeUsers) {
    userMap[u.username] = await User.findOne({ email: u.email });
  }

  // ── DM Chats ───────────────────────────────────────────────────────────────
  let dmCount = 0;
  for (const convo of dmConversations) {
    const userA = userMap[convo.userA];
    const userB = userMap[convo.userB];

    // skip if chat already exists
    const existing = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [userA._id, userB._id], $size: 2 },
    });
    if (existing) { console.log(`  skipped DM — ${convo.userA} ↔ ${convo.userB}`); continue; }

    const chat = await Chat.create({
      isGroupChat: false,
      participants: [userA._id, userB._id],
    });

    let lastMsg;
    for (const m of convo.messages) {
      lastMsg = await Message.create({
        sender: userMap[m.from]._id,
        content: m.text,
        chat: chat._id,
      });
    }

    await Chat.findByIdAndUpdate(chat._id, { latestMessage: lastMsg._id });
    console.log(`  created DM — ${convo.userA} ↔ ${convo.userB} (${convo.messages.length} messages)`);
    dmCount++;
  }

  // ── Group Chats ────────────────────────────────────────────────────────────
  let groupCount = 0;
  for (const grp of groupConversations) {
    const existing = await Chat.findOne({ isGroupChat: true, name: grp.name });
    if (existing) { console.log(`  skipped group — ${grp.name}`); continue; }

    const memberIds = grp.members.map((u) => userMap[u]._id);
    const adminId   = userMap[grp.admin]._id;

    const chat = await Chat.create({
      name: grp.name,
      isGroupChat: true,
      participants: memberIds,
      admin: adminId,
    });

    let lastMsg;
    for (const m of grp.messages) {
      lastMsg = await Message.create({
        sender: userMap[m.from]._id,
        content: m.text,
        chat: chat._id,
      });
    }

    await Chat.findByIdAndUpdate(chat._id, { latestMessage: lastMsg._id });
    console.log(`  created group — ${grp.name} (${grp.members.length} members, ${grp.messages.length} messages)`);
    groupCount++;
  }

  console.log(`\nDone. ${dmCount} DMs + ${groupCount} groups created.`);
  console.log('All passwords are: password123');
  process.exit(0);
};

seed().catch((e) => { console.error(e.message); process.exit(1); });
