const Chat = require('../models/Chat');
const User = require('../models/User');

const accessOrCreateDM = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, userId] },
    })
      .populate('participants', '-password')
      .populate({ path: 'latestMessage', populate: { path: 'sender', select: 'username avatar' } });

    if (chat) return res.json(chat);

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    chat = await Chat.create({
      isGroupChat: false,
      participants: [req.user._id, userId],
    });

    chat = await Chat.findById(chat._id).populate('participants', '-password');
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createGroupChat = async (req, res) => {
  const { name, participants } = req.body;

  if (!name || !participants || participants.length < 2) {
    return res.status(400).json({ message: 'Group name and at least 2 participants required' });
  }

  try {
    const allParticipants = [...new Set([...participants, req.user._id.toString()])];

    const chat = await Chat.create({
      name,
      isGroupChat: true,
      participants: allParticipants,
      admin: req.user._id,
    });

    const populated = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'username avatar' },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const renameGroup = async (req, res) => {
  const { chatId, name } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only group admin can rename' });
    }

    chat.name = name;
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('admin', '-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    if (chat.participants.includes(userId)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    chat.participants.push(userId);
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('admin', '-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    chat.participants = chat.participants.filter((p) => p.toString() !== userId);
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('admin', '-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  accessOrCreateDM,
  createGroupChat,
  getMyChats,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
