# Firebase Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Firebase
```bash
npm install firebase
```

### 2. Create Firebase Project
- Go to https://console.firebase.google.com/
- Create new project
- Enable **Firestore Database** (test mode is fine for now)

### 3. Get Your Config
- Firebase Console → Project Settings → Your apps → Add web app
- Copy the `firebaseConfig` object

### 4. Add Config File
```bash
# Copy the example file
cp src/config/firebaseConfig.example.js src/config/firebaseConfig.js
```

Then edit `src/config/firebaseConfig.js` and paste your Firebase config.

### 5. Switch to Firebase

**Option A: Replace DatabaseManager (Recommended)**

In `src/game/session/SessionManager.js`, change:
```javascript
import { DatabaseManager } from './DatabaseManager';
```
to:
```javascript
import { FirebaseDatabaseManager as DatabaseManager } from './FirebaseDatabaseManager';
```

**Option B: Use SessionManagerFirebase**

In your scenes, change:
```javascript
import { SessionManager } from '../session/SessionManager';
```
to:
```javascript
import { SessionManagerFirebase as SessionManager } from '../session/SessionManagerFirebase';
```

### 6. Enable Real-time Leaderboards (Optional but Recommended)

Update `StudentLobby.js` to use real-time subscriptions. See `FIREBASE_INTEGRATION_EXAMPLE.md` for details.

### 7. Set Security Rules

In Firebase Console → Firestore → Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionCode} {
      allow read: if true;
      allow write: if true;  // Change this in production!
    }
  }
}
```

## ✅ That's It!

Your app now uses Firebase! Sessions will persist in the cloud and work across devices.

## 🔥 Real-time Updates

To enable real-time leaderboard updates in `StudentLobby.js`, see the example in `FIREBASE_INTEGRATION_EXAMPLE.md`.

## 🆘 Troubleshooting

**"Firebase not initialized" error?**
- Make sure you created `firebaseConfig.js` (not just the example file)
- Check that your Firebase config values are correct

**"Permission denied" error?**
- Check your Firestore security rules
- Make sure you enabled Firestore Database in Firebase Console

**Sessions not saving?**
- Check browser console for errors
- Verify Firestore is in test mode (allows reads/writes)

