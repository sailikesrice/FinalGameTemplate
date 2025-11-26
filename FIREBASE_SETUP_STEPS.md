# Firebase Setup - Step by Step Guide

## ✅ What's Already Done

- ✅ Firebase SDK installed (`npm install firebase` - already done!)
- ✅ `firebaseConfig.js` file created (needs your config)
- ✅ `SessionManager.js` updated to use Firebase
- ✅ All code is ready to go!

## 📋 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or select existing project)
3. Enter project name: `math-dungeon` (or any name you like)
4. Click **Continue**
5. **Disable Google Analytics** (optional, you can enable later)
6. Click **Create project**
7. Wait for project to be created, then click **Continue**

### Step 2: Enable Firestore Database

1. In your Firebase project, click **"Build"** in the left sidebar
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. Select **"Start in test mode"** (we'll add security rules next)
5. Click **Next**
6. Choose a **location** closest to your users (e.g., `us-central` for US)
7. Click **Enable**

### Step 3: Get Your Firebase Config

1. In Firebase Console, click the **gear icon ⚙️** (top left)
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** `</>` to add a web app
5. Register your app:
   - App nickname: `Math Dungeon Web`
   - Firebase Hosting: (leave unchecked for now)
   - Click **"Register app"**
6. **Copy the `firebaseConfig` object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 4: Add Config to Your Project

1. Open `src/config/firebaseConfig.js` in your project
2. **Replace** the placeholder values with your actual Firebase config
3. Save the file

**Example:**
```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyC...",  // Your actual API key
  authDomain: "math-dungeon-abc123.firebaseapp.com",
  projectId: "math-dungeon-abc123",
  storageBucket: "math-dungeon-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 5: Set Up Security Rules

1. In Firebase Console, go to **"Firestore Database"**
2. Click the **"Rules"** tab
3. You should see the rules editor with existing default rules
4. **Replace** the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions collection - allow read/write for now (development)
    match /sessions/{sessionCode} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

5. **Save the rules:**
   - If you see a **"Publish"** button (usually top-right), click it
   - If you're in **"Develop & Test"** mode (which you mentioned seeing), that's perfect! 
   - **"Develop & Test" mode automatically allows reads/writes for 30 days** - no need to publish anything
   - You can still update the rules if you want, but the default "Develop & Test" rules will work fine for now
   - If you want to customize rules later, look for buttons like **"Deploy"**, **"Save"**, **"Release"**, or a **checkmark ✓**

**Good news:** If you're seeing "Develop & Test" mode, you're all set! The default rules already allow reads and writes, so you can skip this step and move to testing.

⚠️ **Important:** These rules allow anyone to read/write. For production, you should add authentication. But for testing and development, this is fine.

### Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your game in the browser
3. Try creating a teacher session:
   - Go to "Play as Teacher"
   - Select operations
   - Click "Generate Code"
   - Check the browser console for any errors

4. Check Firebase Console:
   - Go to **Firestore Database** → **Data** tab
   - You should see a `sessions` collection
   - Your session code should appear as a document

## 🎉 You're Done!

Your Firebase setup is complete! Sessions will now:
- ✅ Save to the cloud (Firestore)
- ✅ Work across devices
- ✅ Persist even after browser refresh
- ✅ Support real-time leaderboard updates

## 🔥 Optional: Enable Real-time Leaderboards

To make leaderboards update automatically when students finish, update `StudentLobby.js` to use subscriptions. See `FIREBASE_INTEGRATION_EXAMPLE.md` for the code.

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Make sure you added your config to `src/config/firebaseConfig.js`
- Check that all values are correct (no quotes around the values)
- Restart your dev server

### "Permission denied" error
- Check your Firestore security rules (Step 5)
- Make sure rules are published
- Try refreshing the page

### Sessions not appearing in Firestore
- Check browser console for errors
- Make sure Firestore is enabled (Step 2)
- Verify your config is correct

### Can't find Firestore Database
- Make sure you completed Step 2 (Enable Firestore)
- Look for "Firestore Database" under "Build" in the left sidebar

## 📚 Next Steps

- Read `FIREBASE_INTEGRATION_EXAMPLE.md` to enable real-time leaderboards
- Consider adding Firebase Authentication for production
- Set up proper security rules before deploying to production

