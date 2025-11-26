# Testing Guide: Database System on Localhost

This guide explains how to test the teacher and student session code database system locally.

## Prerequisites

1. Node.js installed (v14 or higher)
2. Dependencies installed: `npm install`
3. Development server running

## Step 1: Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8080`

## Step 2: Test Teacher Code Generation

### Test Case 1: Generate a Session Code

1. Open `http://localhost:8080` in your browser
2. Click **"Play as Teacher"**
3. Select math operations (e.g., `+`, `-`, `×`, `÷`)
4. Set rooms per level (e.g., `6`)
5. Click **"Generate Code"**
6. **Expected Result**: A 6-digit session code appears (e.g., `123456`)

### Verify in Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('math_dungeon_sessions')`
4. **Expected Result**: You should see a JSON string containing the session data

### Verify in Application Storage

1. Open Developer Tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Navigate to Local Storage → `http://localhost:8080`
4. Look for key: `math_dungeon_sessions`
5. **Expected Result**: You should see the session data stored

## Step 3: Test Student Code Entry

### Test Case 2: Enter Session Code as Student

1. Open a **new browser tab** or **incognito window** (to simulate a different student)
2. Navigate to `http://localhost:8080`
3. Click **"Play as Student"**
4. Enter the session code generated in Step 2
5. Click **"Join"**
6. **Expected Result**: 
   - If code exists: Game starts with teacher's settings
   - If code invalid: Error message "Invalid code"

### Test Case 3: Invalid Code Handling

1. In the student lobby, enter an invalid code (e.g., `000000`)
2. Click **"Join"**
3. **Expected Result**: Error message "Invalid code"

### Test Case 4: Rankings Display

1. Enter a valid session code in the student lobby
2. Type the code (don't click Join yet)
3. **Expected Result**: Rankings should appear below (if any students have completed levels)

## Step 4: Test Database.txt File

### Test Case 5: Load from database.txt

1. Open `public/database.txt` in a text editor
2. Add a test session manually:
   ```
   999999|+,-,×|6|1700000000000|[]
   ```
3. Save the file
4. **Restart the dev server** (stop with Ctrl+C, then `npm run dev`)
5. Refresh the browser
6. In student lobby, enter code `999999`
7. Click **"Join"**
8. **Expected Result**: Code should be recognized and game should start

### Test Case 6: Database File Format

1. Open `public/database.txt`
2. Verify the format:
   - Comments start with `#`
   - Session entries: `CODE|allowedOps|roomsPerLevel|timestamp|results`
   - Example: `123456|+,-,×,÷|6|1700000000000|[]`

## Step 5: Test Node.js Utility Script

### Test Case 7: List Sessions

```bash
node scripts/database-manager.js list
```

**Expected Result**: Shows all sessions in database.txt

### Test Case 8: Add Session via Script

```bash
node scripts/database-manager.js add 111111 "+,-,×" 6
```

**Expected Result**: 
- Success message: "Session 111111 added successfully"
- Verify in `public/database.txt` that the session was added
- In browser, refresh and try code `111111` as student

### Test Case 9: Remove Session via Script

```bash
node scripts/database-manager.js remove 111111
```

**Expected Result**: 
- Success message: "Session 111111 removed successfully"
- Verify in `public/database.txt` that the session was removed

### Test Case 10: Clear All Sessions

```bash
node scripts/database-manager.js clear
```

**Expected Result**: 
- Success message: "All sessions cleared"
- Verify `public/database.txt` only contains comments

## Step 6: Test Persistence

### Test Case 11: Refresh Browser

1. Generate a session code as teacher
2. **Refresh the browser** (F5)
3. Go to student lobby
4. Enter the same code
5. **Expected Result**: Code should still work (stored in localStorage)

### Test Case 12: Close and Reopen Browser

1. Generate a session code as teacher
2. **Close the browser completely**
3. **Reopen the browser**
4. Navigate to `http://localhost:8080`
5. Go to student lobby
6. Enter the same code
7. **Expected Result**: Code should still work (localStorage persists)

### Test Case 13: Multiple Sessions

1. Generate multiple session codes as teacher (click "Generate Code" multiple times)
2. Each time, note the code
3. In student lobby, test each code
4. **Expected Result**: All codes should work independently

## Step 7: Test Cross-Browser (Optional)

### Test Case 14: Different Browsers

1. Generate a code in Chrome
2. Open Firefox (or Edge)
3. Navigate to `http://localhost:8080`
4. Enter the code as student
5. **Note**: localStorage is browser-specific, so codes won't persist across browsers
6. **Workaround**: Use `database.txt` file to share codes between browsers
7. Add the code to `database.txt` manually or via the script
8. Restart server and test in different browser

## Troubleshooting

### Issue: Code not found in student lobby

**Solutions**:
1. Check browser console for errors (F12 → Console)
2. Verify localStorage has the session: `localStorage.getItem('math_dungeon_sessions')`
3. Check if database.txt is being loaded (check Network tab in DevTools)
4. Verify the code format is correct (6 digits)

### Issue: database.txt not loading

**Solutions**:
1. Verify file exists in `public/database.txt`
2. Check file format (should have proper format)
3. Restart dev server
4. Check browser console for fetch errors
5. Verify file is served by checking Network tab in DevTools

### Issue: Node.js script not working

**Solutions**:
1. Verify Node.js version: `node --version` (should be v14+)
2. Check file path: `scripts/database-manager.js`
3. Verify `public/database.txt` exists
4. Check file permissions

### Issue: localStorage quota exceeded

**Solutions**:
1. Clear browser localStorage: DevTools → Application → Local Storage → Clear
2. Limit the number of sessions
3. Use database.txt file instead

## Expected Behavior Summary

✅ **Teacher generates code** → Code saved to localStorage → Code displayed on screen  
✅ **Student enters code** → Code validated from localStorage/database → Game starts with teacher settings  
✅ **database.txt file** → Loaded on app startup → Merged with localStorage  
✅ **Node.js script** → Can add/remove/list sessions in database.txt  
✅ **Persistence** → Codes persist across browser refreshes  
✅ **Multiple codes** → Can generate and use multiple codes independently  

## Quick Test Checklist

- [ ] Dev server starts on `http://localhost:8080`
- [ ] Teacher can generate session code
- [ ] Session code appears on screen
- [ ] Student can enter session code
- [ ] Student can join session successfully
- [ ] Invalid codes show error message
- [ ] Rankings display in student lobby
- [ ] Codes persist after browser refresh
- [ ] database.txt file loads on startup
- [ ] Node.js script can add sessions
- [ ] Node.js script can remove sessions
- [ ] Node.js script can list sessions
- [ ] Multiple codes work independently

## Additional Notes

- **localStorage** is browser-specific and persists across sessions
- **database.txt** is loaded on app startup and merged with localStorage
- **Node.js script** is for managing database.txt outside the browser
- Codes are 6-digit numbers (100000-999999)
- Session data includes: code, allowed operations, rooms per level, timestamp, results

