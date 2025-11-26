# MongoDB Integration Guide for Math Dungeon

## Why MongoDB?

MongoDB is a good choice if you:
- Need more complex queries and aggregations
- Want full control over your database
- Already have a backend server
- Need advanced data relationships

**Note:** MongoDB requires a backend server, unlike Firebase which works client-side.

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use `0.0.0.0/0` for development)
6. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

### Option B: Local MongoDB

1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/math-dungeon`

## Step 2: Create Backend Server

You'll need a Node.js/Express server to handle MongoDB operations.

### Install Dependencies

```bash
npm install express mongodb cors dotenv
# or
npm install express mongoose cors dotenv
```

### Basic Server Structure

Create `server/index.js`:

```javascript
import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'math-dungeon';
const COLLECTION_NAME = 'sessions';

let db;

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Get session
app.get('/api/sessions/:code', async (req, res) => {
  try {
    const session = await db.collection(COLLECTION_NAME).findOne({ code: req.params.code });
    res.json(session || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create session
app.post('/api/sessions', async (req, res) => {
  try {
    const { code, config } = req.body;
    const session = {
      code,
      config,
      results: [],
      timestamp: Date.now()
    };
    await db.collection(COLLECTION_NAME).insertOne(session);
    res.json({ code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add result
app.post('/api/sessions/:code/results', async (req, res) => {
  try {
    const { result } = req.body;
    await db.collection(COLLECTION_NAME).updateOne(
      { code: req.params.code },
      { 
        $push: { results: { ...result, ts: Date.now() } },
        $set: { updatedAt: Date.now() }
      }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 3: Real-time Updates

For real-time leaderboard updates, you'll need WebSockets:

```bash
npm install socket.io
```

Update server to use Socket.io:

```javascript
import { Server } from 'socket.io';

const io = new Server(server);

// When a result is added, emit to all clients watching that session
io.on('connection', (socket) => {
  socket.on('subscribe-session', (code) => {
    socket.join(`session-${code}`);
  });
});

// In your add result endpoint:
io.to(`session-${code}`).emit('session-updated', updatedSession);
```

## Step 4: Update Frontend

Create `src/game/session/MongoDatabaseManager.js` that makes HTTP requests to your backend instead of using Firebase.

## Recommendation

For this project, **Firebase is simpler** because:
- No backend server needed
- Built-in real-time updates
- Easier to deploy
- Free tier is generous

Use MongoDB if you need more complex database operations or already have a backend infrastructure.

