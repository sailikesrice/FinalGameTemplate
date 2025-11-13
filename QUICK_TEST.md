# Quick Testing Guide

## 🚀 Quick Start (5 minutes)

### 1. Start the Server
```bash
npm run dev
```
Open browser to: `http://localhost:8080`

### 2. Test Teacher Code Generation
1. Click **"Play as Teacher"**
2. Select operations: `+`, `-`, `×`, `÷`
3. Set rooms: `6`
4. Click **"Generate Code"**
5. **Expected**: A 6-digit code appears (e.g., `123456`)

### 3. Test Student Code Entry
1. Open a **new tab** (simulate different student)
2. Click **"Play as Student"**
3. Enter the code from step 2 (e.g., `123456`)
4. Click **"Join"**
5. **Expected**: Game starts with teacher's settings

### 4. Test Pre-loaded Code
1. In student lobby, enter code: `999999`
2. Click **"Join"**
3. **Expected**: Game starts (this code is pre-loaded in database.txt)

## 🧪 Verify Database

### Check localStorage (Browser Console)
```javascript
localStorage.getItem('math_dungeon_sessions')
```
Should show JSON with session data.

### Check database.txt File
```bash
node scripts/database-manager.js list
```
Should show all sessions.

### Add Session via Script
```bash
node scripts/database-manager.js add 111111 "+,-,×" 6
```

### Test Added Session
1. **Restart dev server** (Ctrl+C, then `npm run dev`)
2. Refresh browser
3. In student lobby, enter code: `111111`
4. Click **"Join"**
5. **Expected**: Game starts

## ✅ Success Criteria

- [x] Teacher can generate session code
- [x] Code appears on screen
- [x] Student can enter code
- [x] Student can join session
- [x] Invalid codes show error
- [x] Codes persist after refresh
- [x] database.txt loads on startup
- [x] Node.js script works

## 🐛 Troubleshooting

**Code not found?**
- Check browser console (F12)
- Verify localStorage has data
- Restart dev server
- Check database.txt format

**database.txt not loading?**
- Verify file exists in `public/database.txt`
- Check file format (CODE|OPS|ROOMS|TIMESTAMP|RESULTS)
- Restart dev server
- Check browser console for errors

**Node.js script not working?**
- Verify Node.js version: `node --version` (v14+)
- Check file path: `scripts/database-manager.js`
- Verify `public/database.txt` exists

## 📝 Test Example

1. **Generate code**: `123456`
2. **Save to database.txt**: 
   ```bash
   node scripts/database-manager.js add 123456 "+,-,×,÷" 6
   ```
3. **Test in browser**: Enter `123456` as student
4. **Expected**: Game starts successfully

## 🔄 Testing Flow

```
Teacher → Generate Code → Saved to localStorage → Displayed
                                           ↓
Student → Enter Code → Check localStorage/database.txt → Join Game
```

## 📊 Database Structure

```
Code: 999999
Operations: +, -, ×, ÷
Rooms per level: 6
Results: [] (empty array)
Timestamp: 1700000000000
```

## 🎯 Key Points

- **localStorage** persists codes across browser sessions
- **database.txt** loads on app startup
- **Node.js script** manages database.txt outside browser
- Codes are **6-digit numbers** (100000-999999)
- Each code has **settings** (operations, rooms) and **results** (student scores)

