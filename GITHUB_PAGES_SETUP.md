# GitHub Pages Setup Guide

Follow these steps to deploy your Math Dungeon game to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your project already pushed to a GitHub repository

---

## Step 1: Install gh-pages Package

Run this command in your project directory:

```bash
npm install --save-dev gh-pages
```

This installs the `gh-pages` package that will deploy your built files to GitHub Pages.

---

## Step 2: Update package.json Homepage

You need to update the `homepage` field in `package.json` with your GitHub repository URL.

**Format:** `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

**Example:**
- If your GitHub username is `johndoe` and your repo is `math-dungeon`
- The homepage would be: `https://johndoe.github.io/math-dungeon`

**Update this line in `package.json`:**
```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
```

---

## Step 3: Verify Vite Configuration

Your `vite/config.prod.mjs` already has `base: './'` which is correct for GitHub Pages. This ensures all assets load correctly.

If you need to change it, make sure it's set to:
```js
base: './',  // For GitHub Pages (subdirectory)
// OR
base: '/YOUR_REPO_NAME/',  // Alternative: explicit repo path
```

---

## Step 4: Build and Deploy

### First Time Setup:

1. **Make sure your code is committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Setup for GitHub Pages deployment"
   git push origin main
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

   This command will:
   - Build your project (`npm run build`)
   - Create a `gh-pages` branch
   - Push the built files to that branch
   - GitHub Pages will automatically serve from the `gh-pages` branch

3. **Wait a few minutes** for GitHub to process the deployment.

---

## Step 5: Enable GitHub Pages

1. **Go to your GitHub repository** on GitHub.com

2. **Click on "Settings"** (top menu of your repo)

3. **Scroll down to "Pages"** in the left sidebar

4. **Under "Source":**
   - Select: **"Deploy from a branch"**
   - Branch: **`gh-pages`**
   - Folder: **`/ (root)`**

5. **Click "Save"**

6. **Your site will be available at:**
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

   ⚠️ **Note:** It may take 5-10 minutes for the site to be live the first time.

---

## Step 6: Future Updates

Every time you want to update your deployed game:

1. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "Update game"
   git push origin main
   ```

2. **Deploy again:**
   ```bash
   npm run deploy
   ```

3. **Wait a few minutes** for GitHub to update the site.

---

## Troubleshooting

### Assets Not Loading

If images or assets don't load:

1. **Check the browser console** for 404 errors
2. **Verify `base: './'`** in `vite/config.prod.mjs`
3. **Make sure assets are in the `public/` folder**

### 404 Error on Page Refresh

This is normal for single-page apps on GitHub Pages. Users should navigate using your app's buttons, not browser refresh.

### Site Not Updating

- Wait 5-10 minutes after deployment
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check the GitHub Pages settings to ensure `gh-pages` branch is selected

### Build Errors

If `npm run deploy` fails:

1. **Test the build locally first:**
   ```bash
   npm run build
   ```

2. **Check for errors** in the build output

3. **Make sure all dependencies are installed:**
   ```bash
   npm install
   ```

### Firebase Not Working

If Firebase doesn't work on GitHub Pages:

1. **Check Firebase Console:**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your GitHub Pages domain: `YOUR_USERNAME.github.io`

2. **Verify environment variables** are set correctly in your code

---

## Custom Domain (Optional)

If you have a custom domain:

1. **Create a `CNAME` file** in your `public/` folder:
   ```
   yourdomain.com
   ```

2. **Deploy again:**
   ```bash
   npm run deploy
   ```

3. **Configure DNS** at your domain provider:
   - Add a CNAME record pointing to `YOUR_USERNAME.github.io`

4. **Update GitHub Pages settings:**
   - Go to Settings → Pages
   - Add your custom domain

---

## Quick Reference

**Deploy command:**
```bash
npm run deploy
```

**Your site URL:**
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

**Update process:**
1. Make changes
2. `git add . && git commit -m "message" && git push`
3. `npm run deploy`
4. Wait 5-10 minutes

---

## Need Help?

- Check GitHub Pages documentation: https://docs.github.com/en/pages
- Check your repository's Actions tab for deployment logs
- Verify the `gh-pages` branch exists and has files in it

Good luck with your deployment! 🚀

