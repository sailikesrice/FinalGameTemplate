# Firebase Integration Guide for Math Dungeon

## Why Firebase?

Firebase is perfect for this project because:
- ✅ **Real-time synchronization** - Leaderboards update instantly
- ✅ **No backend server needed** - Works directly from the browser
- ✅ **Easy authentication** - Can add teacher/student login later
- ✅ **Free tier** - Generous free plan for development
- ✅ **Scalable** - Handles multiple concurrent sessions easily

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Enable **Firestore Database** (not Realtime Database):
   - Go to "Build" → "Firestore Database"
   - Click "Create database"
   - Start in **test mode** (we'll add security rules later)
   - Choose a location closest to your users

## Step 2: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app (give it a nickname like "Math Dungeon")
5. Copy the `firebaseConfig` object - it looks like:
   ```javascript
   {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   }
   ```

## Step 3: Install Firebase SDK

Run this command in your project directory:
```bash
npm install firebase
```

## Step 4: Add Firebase Config

Create `src/config/firebaseConfig.js` with your Firebase config (see `firebaseConfig.example.js`)

## Step 5: Security Rules (Important!)

In Firebase Console → Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions collection - anyone can read, only authenticated users can write
    match /sessions/{sessionCode} {
      allow read: if true;  // Anyone can read sessions
      allow write: if request.auth != null;  // Only authenticated users can write
      
      // For now, allow writes without auth (remove in production!)
      // allow write: if true;
    }
  }
}
```

**⚠️ For development/testing, you can use `allow write: if true;` but change this before production!**

## Step 6: Usage

The `FirebaseDatabaseManager.js` replaces `DatabaseManager.js` and provides the same interface, so your existing code will work with minimal changes.

## MongoDB Alternative

If you prefer MongoDB, you'll need:
- A backend server (Node.js + Express)
- MongoDB Atlas (cloud) or local MongoDB
- WebSocket server for real-time updates
- More complex setup

See `MONGODB_SETUP.md` for MongoDB instructions.

