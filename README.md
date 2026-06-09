# Talk-a-Tive

A real-time chat application built with the MERN stack and Socket.io. Supports one-on-one and group messaging, online presence indicators, and typing notifications.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Socket.io-client, Axios, React Router v7

**Backend:** Node.js, Express 5, MongoDB, Mongoose, Socket.io, JWT, bcryptjs

## Features

- User authentication (signup / login) with JWT
- One-on-one and group chats
- Real-time messaging via Socket.io
- Online/offline presence indicators
- Typing indicators
- Rate limiting and security headers (helmet)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Aradhya0504/Talk-A-Tive.git
cd Talk-A-Tive
```

### 2. Set up environment variables

Create a `.env` file inside the `backend/` directory:

```bash
cd backend
cp .env.example .env   # or create the file manually
```

Fill in the values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/talktive
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 3. Install dependencies

From the project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 4. Run the app

**Run both frontend and backend together (recommended):**

```bash
npm run dev
```

**Or run them separately:**

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

The backend will start on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## Project Structure

```
Talk-a-Tive/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers (auth, chat, message)
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Mongoose models (User, Chat, Message)
│   ├── routes/         # Express routers
│   ├── seed.js         # Optional database seeder
│   └── server.js       # Entry point, Socket.io setup
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── context/    # Auth and Socket context providers
│       ├── pages/      # Login, Signup, Chat pages
│       └── utils/      # Axios instance / API helpers
├── package.json        # Root scripts (concurrently)
└── .gitignore
```

## Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `user:online` | Client → Server | Register user as online |
| `users:online` | Server → All | Broadcast online user list |
| `chat:join` | Client → Server | Join a chat room |
| `chat:leave` | Client → Server | Leave a chat room |
| `message:send` | Client → Server | Send a message to a room |
| `message:receive` | Server → Room | Deliver message to recipients |
| `typing:start` | Client → Server | Notify room of typing start |
| `typing:stop` | Client → Server | Notify room of typing stop |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/chats` | Get all chats for logged-in user |
| POST | `/api/chats` | Create or access a one-on-one chat |
| POST | `/api/chats/group` | Create a group chat |
| GET | `/api/messages/:chatId` | Get messages for a chat |
| POST | `/api/messages` | Send a message |
| GET | `/api/health` | Health check |

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the backend server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
