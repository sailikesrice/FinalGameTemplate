# Vercel Deployment Guide

This guide will help you deploy your Math Dungeon game to Vercel.

## Prerequisites

- A GitHub account
- Your code pushed to a GitHub repository
- A Vercel account (free signup at [vercel.com](https://vercel.com))

---

## Method 1: GitHub Integration (Recommended) ⭐

This method automatically deploys your site whenever you push code to GitHub.

### Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended for easy integration)

### Step 3: Import Your Project

1. After logging in, click **"Add New Project"**
2. You'll see a list of your GitHub repositories
3. Find and select your **FinalGameTemplate** repository
4. Click **"Import"**

### Step 4: Configure Project Settings

Vercel should auto-detect your Vite project, but verify these settings:

- **Framework Preset:** `Vite` (should be auto-detected)
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `dist` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

### Step 5: Environment Variables (If Using Firebase)

If you're using Firebase, you'll need to add your Firebase config as environment variables.

#### Where to Find Firebase Config Values:

1. **Go to Firebase Console:**
   - Visit [console.firebase.google.com](https://console.firebase.google.com/)
   - Select your Firebase project (or create one if you haven't)

2. **Open Project Settings:**
   - Click the **gear icon ⚙️** (top left, next to "Project Overview")
   - Click **"Project settings"**

3. **Find Your Web App Config:**
   - Scroll down to the **"Your apps"** section
   - If you don't have a web app yet:
     - Click the **web icon `</>`** to add a web app
     - Give it a nickname (e.g., "Math Dungeon Web")
     - Click **"Register app"**
   - You'll see a `firebaseConfig` object that looks like this:

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

4. **Copy Each Value:**
   - `apiKey` → This is your **VITE_FIREBASE_API_KEY**
   - `authDomain` → This is your **VITE_FIREBASE_AUTH_DOMAIN**
   - `projectId` → This is your **VITE_FIREBASE_PROJECT_ID**
   - `storageBucket` → This is your **VITE_FIREBASE_STORAGE_BUCKET**
   - `messagingSenderId` → This is your **VITE_FIREBASE_MESSAGING_SENDER_ID**
   - `appId` → This is your **VITE_FIREBASE_APP_ID**

#### Add to Vercel:

1. In Vercel project settings, scroll to **"Environment Variables"**
2. Click **"Add"** for each variable:
   - **Name:** `VITE_FIREBASE_API_KEY` → **Value:** (paste your `apiKey` from Firebase)
   - **Name:** `VITE_FIREBASE_AUTH_DOMAIN` → **Value:** (paste your `authDomain` from Firebase)
   - **Name:** `VITE_FIREBASE_PROJECT_ID` → **Value:** (paste your `projectId` from Firebase)
   - **Name:** `VITE_FIREBASE_STORAGE_BUCKET` → **Value:** (paste your `storageBucket` from Firebase)
   - **Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID` → **Value:** (paste your `messagingSenderId` from Firebase)
   - **Name:** `VITE_FIREBASE_APP_ID` → **Value:** (paste your `appId` from Firebase)
3. Make sure to select **"Production"**, **"Preview"**, and **"Development"** for each variable (or at least Production)
4. Click **"Save"**

**OR** if you prefer to keep using the config file:
- Make sure `src/config/firebaseConfig.js` is in your repository (it's currently in .gitignore)
- You may need to temporarily remove it from .gitignore or use environment variables instead

### Step 6: Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. Your site will be live at: `your-project-name.vercel.app` 🎉

### Step 7: Automatic Deployments

From now on:
- Every time you push to your `main` branch → **Production deployment**
- Every time you create a pull request → **Preview deployment**

---

## Changing Branch Source

If you want to change which branch deploys to production:

> **Note:** The "Production Branch" option only appears **after** you've deployed your project and connected it to a Git repository. If you don't see it, you need to deploy first (see Step 6 above).


### Method 1: Via Vercel Dashboard (Recommended)

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project name
3. Go to **"Settings"** tab
4. Click **"Environments"** in the left sidebar (or go directly to **Settings → Environments → Production**)
5. Under **"Production"**, find **"Branch Tracking"**
6. Click the dropdown or edit button next to the branch name
7. Select or type the branch you want (e.g., `main`, `master`, `0.9.11`, `develop`)
8. Click **"Save"**
9. Vercel will automatically redeploy from the new branch

**Note:** The Production Branch setting is located at:
- **Settings → Environments → Production → Branch Tracking**

### If You Don't See "Production Branch" Option:

If you only see "Deploy hooks", "Git large file storage", and "Ignored build step" (but no "Production Branch"), it means your project **isn't connected to a Git repository**.

#### To Connect Your Project to Git:

1. **Go to Settings → Git**
2. **Look for "Connect Git Repository" button** (usually at the top)
3. **Click "Connect Git Repository"**
4. **Select your Git provider:**
   - GitHub (most common)
   - GitLab
   - Bitbucket
5. **Authorize Vercel** to access your repositories (if prompted)
6. **Select your repository** from the list
7. **Click "Import"** or "Connect"

#### After Connecting:

- The "Production Branch" option will appear
- You'll see your repository name and branch information
- Future deployments will be automatic when you push to Git

#### If You Deployed via CLI Without Git:

If you used `vercel` CLI command without connecting to Git:
- You'll need to connect it manually (steps above)
- OR redeploy using the GitHub integration method (Method 1 in the setup guide)

#### Quick Check:

- **Settings → Git** should show:
  - Your repository name
  - Connected provider (GitHub/GitLab/Bitbucket)
  - Production Branch option
- If you don't see these, click **"Connect Git Repository"**

#### If Connected But Still No Production Branch:

If your project is connected to Git but you still don't see "Production Branch", try these:

1. **Check the Top of Git Settings:**
   - In **Settings → Git**, look at the very top
   - You should see your repository name and provider
   - The Production Branch might be shown there as a link or button

2. **Check Deployments Tab:**
   - Go to the **"Deployments"** tab (not Settings)
   - Look at your latest deployment
   - Click on it to see details
   - Check which branch it deployed from
   - You might see branch information there

3. **Check if Branch is Set Automatically:**
   - Vercel might automatically use your repository's default branch
   - Check your GitHub repository settings to see what the default branch is
   - Usually `main` or `master`
   - If you only have one branch, Vercel might not show the option

4. **Try Disconnecting and Reconnecting:**
   - In **Settings → Git**, look for "Disconnect" or "Change Repository"
   - Disconnect the current repository
   - Reconnect it using "Connect Git Repository"
   - This sometimes refreshes the settings

5. **Check Vercel Dashboard Home:**
   - On your project's main page (not Settings)
   - Look for branch information in the deployment cards
   - Or check the project overview

6. **Alternative: Use Vercel CLI:**
   ```bash
   vercel --prod
   ```
   - This will deploy from your current Git branch
   - The branch used will become the production branch

**Note:** In some Vercel UI versions, if you only have one branch or if the branch is set automatically to your default branch, the Production Branch option might not be visible. The production branch is likely already set to your repository's default branch (usually `main` or `master`).

### Method 2: Deploy from a Specific Branch

After setting the branch in **Settings → Environments → Production → Branch Tracking**, you can deploy it:

#### Option A: Automatic Deployment (Recommended)
- **Push code to the branch** (`0.9.11` in your case)
- Vercel will automatically detect the push and deploy
- Go to the **"Deployments"** tab to see the deployment progress

#### Option B: Manual Deployment via Dashboard
1. Go to the **"Deployments"** tab
2. Click **"Redeploy"** on your latest deployment
3. Or click **"Create Deployment"** button
4. Select the branch (`0.9.11`)
5. Click **"Deploy"**

#### Option C: Manual Deployment via CLI
```bash
# Make sure you're on the branch locally
git checkout 0.9.11

# Deploy to production
vercel --prod
```

Or deploy a specific branch without checking out:
```bash
vercel --prod --branch=0.9.11
```

### Preview Branches

- **All other branches** automatically create preview deployments
- You can disable this in **Settings** → **Git** → **"Ignored Build Step"** if needed
- Pull requests also create preview deployments automatically

### Branch Protection

If you want to require approval before production deployments:
1. Go to **Settings** → **Git**
2. Enable **"Production Branch Protection"**
3. This requires manual approval for production deployments

---

## Method 2: Vercel CLI (Alternative)

If you prefer using the command line:

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Choose your account)
- Link to existing project? **No** (for first deployment)
- Project name? (Press Enter for default)
- Directory? (Press Enter for current directory)

### Step 4: Production Deployment

For production:

```bash
vercel --prod
```

---

## Configuration Files

I've created two files for you:

### `vercel.json`
- Configures build settings
- Sets up SPA routing (all routes redirect to index.html)
- Optimizes asset caching

### `.vercelignore`
- Tells Vercel which files to ignore during deployment

---

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Test locally first:**
   ```bash
   npm run build
   ```
3. **Common issues:**
   - Missing dependencies → Run `npm install`
   - TypeScript errors → Fix type errors
   - Import errors → Check file paths

### Assets Not Loading

1. Check that `base: './'` is set in `vite/config.prod.mjs` ✅ (already set)
2. Verify assets are in the `public/` folder
3. Check browser console for 404 errors

### Firebase Not Working

1. **If using environment variables:**
   - Make sure all variables are set in Vercel dashboard
   - Update your code to read from `import.meta.env.VITE_*` instead of the config file

2. **If using config file:**
   - Make sure `firebaseConfig.js` is committed to Git (remove from .gitignore temporarily)
   - **OR** better: Use environment variables for security

### Routing Issues (404 on Refresh)

The `vercel.json` file I created includes a rewrite rule to fix this. If you still have issues:
- Make sure `vercel.json` is in your repository root
- The rewrite rule should send all routes to `index.html`

---

## Custom Domain

To add a custom domain:

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter your domain name
5. Follow DNS configuration instructions
6. Vercel will automatically provision SSL certificate

---

## Environment Variables Setup

If you want to use environment variables for Firebase (recommended for security):

### 1. Update `src/config/firebaseConfig.js`:

```javascript
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};
```

### 2. Add variables in Vercel:
- Project Settings → Environment Variables
- Add each `VITE_FIREBASE_*` variable
- Redeploy

---

## Next Steps

1. ✅ Deploy to Vercel using Method 1 (GitHub integration)
2. ✅ Test your deployed site
3. ✅ Set up environment variables if using Firebase
4. ✅ (Optional) Add custom domain
5. ✅ Share your game URL! 🎮

---

## Quick Reference

- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Support:** [vercel.com/support](https://vercel.com/support)

---

## Need Help?

If you encounter any issues:
1. Check the build logs in Vercel dashboard
2. Test your build locally: `npm run build`
3. Check browser console for runtime errors
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀

