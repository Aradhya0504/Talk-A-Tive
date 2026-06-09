require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const User = require('./models/User');

connectDB();

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api/auth', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ─── Socket.io ───────────────────────────────────────────────────────────────

const onlineUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  socket.on('user:online', async (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });

  socket.on('chat:join', (chatId) => {
    socket.join(chatId);
  });

  socket.on('chat:leave', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('message:send', (message) => {
    // Broadcast to all room members except sender
    socket.to(message.chat._id || message.chat).emit('message:receive', message);
  });

  socket.on('typing:start', ({ chatId, username }) => {
    socket.to(chatId).emit('typing:start', { chatId, username });
  });

  socket.on('typing:stop', ({ chatId, username }) => {
    socket.to(chatId).emit('typing:stop', { chatId, username });
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      io.emit('users:online', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
