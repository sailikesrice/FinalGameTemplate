# Free Web Hosting Guide for Math Dungeon Game

This guide covers several free hosting options for your React + Phaser game.

## Table of Contents
1. [Vercel (Recommended)](#vercel-recommended)
2. [Netlify](#netlify)
3. [Firebase Hosting](#firebase-hosting)
4. [GitHub Pages](#github-pages)
5. [Render](#render)

---

## 1. Vercel (Recommended) ⭐

**Best for:** React apps, automatic deployments, great performance

### Pros:
- ✅ Zero configuration needed
- ✅ Automatic deployments from Git
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Custom domains
- ✅ Great for React/Next.js

### Cons:
- ⚠️ Free tier has bandwidth limits (100GB/month)

### Setup Steps:

#### Option A: Using Vercel CLI (Quickest)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Build your project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - It will ask you to login/create account
   - Choose your project settings
   - Done! You'll get a URL like `your-game.vercel.app`

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

#### Option B: Using GitHub Integration (Recommended for continuous deployment)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign up/login

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure project:**
   - Framework Preset: **Vite** (or React)
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist` (check your `vite.config.js`)

6. **Click "Deploy"**

7. **Every time you push to GitHub, Vercel will auto-deploy!**

### Custom Domain:
- Go to Project Settings → Domains
- Add your domain
- Follow DNS configuration instructions

---

## 2. Netlify

**Best for:** Static sites, easy drag-and-drop deployment

### Pros:
- ✅ Very easy to use
- ✅ Drag-and-drop deployment option
- ✅ Free SSL
- ✅ Continuous deployment from Git
- ✅ Form handling (if needed)

### Cons:
- ⚠️ 100GB bandwidth/month on free tier

### Setup Steps:

#### Option A: Drag and Drop (Easiest)

1. **Build your project:**
   ```bash
   npm run build
   ```

2. **Go to [netlify.com](https://netlify.com)** and sign up/login

3. **Drag your `dist` folder** onto the Netlify dashboard

4. **Done!** You'll get a URL like `random-name-123.netlify.app`

#### Option B: Git Integration (Recommended)

1. **Push code to GitHub**

2. **Go to Netlify** → "Add new site" → "Import an existing project"

3. **Connect GitHub** and select your repository

4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Click "Deploy site"**

6. **Auto-deploys on every Git push!**

### Custom Domain:
- Site settings → Domain management → Add custom domain

---

## 3. Firebase Hosting

**Best for:** If you're already using Firebase (you are!)

### Pros:
- ✅ Free tier: 10GB storage, 360MB/day transfer
- ✅ Already using Firebase
- ✅ Fast CDN
- ✅ Easy integration with Firebase services

### Cons:
- ⚠️ Lower bandwidth limits than Vercel/Netlify

### Setup Steps:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project:**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `dist`
   - Configure as single-page app: **Yes**
   - Set up automatic builds: **No** (or Yes if you want)

4. **Build your project:**
   ```bash
   npm run build
   ```

5. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

6. **Your site will be at:** `your-project-id.web.app`

### Continuous Deployment:
- Use GitHub Actions or connect to Firebase Console → Hosting → Connect GitHub

---

## 4. GitHub Pages

**Best for:** Simple static hosting, already using GitHub

### Pros:
- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Custom domains supported

### Cons:
- ⚠️ No server-side features
- ⚠️ Requires GitHub Actions for automatic builds
- ⚠️ Slower than CDN options

### Setup Steps:

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to `package.json`:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/your-repo-name"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: `gh-pages` branch
   - Your site: `https://yourusername.github.io/your-repo-name`

### Note:
- Update `vite.config.js` base path if needed:
  ```js
  export default {
    base: '/your-repo-name/',
    // ... rest of config
  }
  ```

---

## 5. Render

**Best for:** Full-stack apps, but also supports static sites

### Pros:
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Custom domains

### Cons:
- ⚠️ Free tier spins down after inactivity
- ⚠️ Slower cold starts

### Setup Steps:

1. **Go to [render.com](https://render.com)** and sign up

2. **Create new "Static Site"**

3. **Connect your GitHub repository**

4. **Configure:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

5. **Click "Create Static Site"**

---

## Comparison Table

| Platform | Ease of Use | Free Bandwidth | Auto Deploy | Best For |
|----------|-------------|----------------|-------------|----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | 100GB/month | ✅ | React apps |
| **Netlify** | ⭐⭐⭐⭐⭐ | 100GB/month | ✅ | Static sites |
| **Firebase** | ⭐⭐⭐⭐ | 360MB/day | ⚠️ Manual | Firebase users |
| **GitHub Pages** | ⭐⭐⭐ | Unlimited* | ⚠️ Manual | GitHub users |
| **Render** | ⭐⭐⭐⭐ | Limited | ✅ | Full-stack |

*GitHub Pages has soft limits

---

## Recommended Setup: Vercel + GitHub

**Why?**
- Easiest setup
- Automatic deployments
- Best performance
- Great developer experience

**Quick Start:**
1. Push code to GitHub
2. Sign up at vercel.com
3. Import repository
4. Deploy (takes ~2 minutes)
5. Done! 🎉

---

## Important Notes for Your Game

### 1. Environment Variables
If you have Firebase config or API keys, set them in your hosting platform:
- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables
- **Firebase:** Already configured in your project

### 2. Build Configuration
Make sure your `vite.config.js` is set up correctly:
```js
export default {
  base: './', // or '/' for root domain
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
}
```

### 3. Asset Paths
Your assets should work automatically with Vite, but if you have issues:
- Use relative paths: `./assets/...`
- Or ensure `base` is set correctly in `vite.config.js`

### 4. Firebase Configuration
Your Firebase config should work the same in production. Make sure:
- Firebase project allows your domain
- CORS settings are correct
- Security rules allow public access (if needed)

---

## Troubleshooting

### Build Fails
- Check build logs in hosting platform
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`

### Assets Not Loading
- Check `base` path in `vite.config.js`
- Ensure assets are in `public/` folder
- Check browser console for 404 errors

### Firebase Not Working
- Check Firebase console for domain restrictions
- Verify environment variables are set
- Check browser console for errors

---

## Next Steps

1. **Choose a platform** (I recommend Vercel)
2. **Test locally:** `npm run build && npm run preview`
3. **Deploy using one of the methods above**
4. **Share your game URL!** 🎮

Need help with a specific platform? Let me know!

