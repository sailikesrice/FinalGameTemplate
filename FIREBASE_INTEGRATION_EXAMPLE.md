# Firebase Integration Example - Real-time Leaderboards

This shows how to update `StudentLobby.js` to use Firebase real-time updates.

## Current Code (StudentLobby.js)

The current code polls for updates manually. Here's how to make it real-time:

## Updated StudentLobby with Real-time Updates

```javascript
import { Scene } from 'phaser';
import { SessionManagerFirebase as SessionManager } from '../session/SessionManagerFirebase';
import { GameSettings } from '../dungeon/GameSettings';

export class StudentLobby extends Scene {
  constructor() { super('StudentLobby'); }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 120, 'Student Lobby', { 
      fontFamily: 'Arial Black', 
      fontSize: 40, 
      color: '#ffffff' 
    }).setOrigin(0.5);
    
    this.add.text(centerX, centerY - 60, 'Enter Session Code', { 
      fontFamily: 'Arial Black', 
      fontSize: 22, 
      color: '#ffffff' 
    }).setOrigin(0.5);

    const inputBg = this.add.rectangle(centerX, centerY - 20, 220, 46, 0x333333)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    inputBg.setStrokeStyle(2, 0x88c0ff, 1);
    
    const inputText = this.add.text(centerX, centerY - 20, '', { 
      fontFamily: 'Arial Black', 
      fontSize: 24, 
      color: '#ffee58' 
    }).setOrigin(0.5);
    
    // Rankings display
    const rankLabel = this.add.text(centerX, centerY + 170, 'Rankings (fastest first)', { 
      fontFamily: 'Arial Black', 
      fontSize: 18, 
      color: '#ffffff' 
    }).setOrigin(0.5);
    
    this.rankLines = [];
    this.currentSessionCode = null; // Track current subscription
    
    // Draw rankings function
    const drawRankings = (session) => {
      // Clear previous rankings
      if (this.rankLines) {
        this.rankLines.forEach(l => { 
          try { l.destroy(); } catch(e) {} 
        });
      }
      this.rankLines = [];
      
      if (!session || !session.results || session.results.length === 0) {
        return;
      }
      
      const top = session.results.slice(0, 5);
      top.forEach((r, idx) => {
        const secs = Math.floor((r.elapsedMs||0)/1000);
        const mins = Math.floor(secs / 60);
        const secsRem = secs % 60;
        const timeStr = `${mins}:${String(secsRem).padStart(2, '0')}`;
        const name = r.studentName || 'Student';
        const y = centerY + 200 + (idx * 30);
        const text = `${idx + 1}. ${name} - ${timeStr}`;
        const line = this.add.text(centerX, y, text, { 
          fontFamily: 'Arial', 
          fontSize: 16, 
          color: idx === 0 ? '#ffee58' : '#ffffff' 
        }).setOrigin(0.5);
        this.rankLines.push(line);
      });
    };
    
    // Handle input changes
    let inputTimeout;
    inputBg.on('pointerdown', () => {
      // Simple input handling - in production, use a proper input field
      const currentCode = inputText.text.trim();
      const newCode = prompt('Enter 6-digit session code:', currentCode) || '';
      
      if (newCode.length === 6 && /^\d+$/.test(newCode)) {
        inputText.setText(newCode);
        
        // Unsubscribe from previous session
        if (this.currentSessionCode) {
          SessionManager.unsubscribeFromSession(this.currentSessionCode);
        }
        
        // Subscribe to new session for real-time updates
        this.currentSessionCode = newCode;
        SessionManager.subscribeToSession(newCode, (session) => {
          if (session) {
            drawRankings(session);
          } else {
            // Session not found
            if (this.rankLines) {
              this.rankLines.forEach(l => { 
                try { l.destroy(); } catch(e) {} 
              });
            }
            this.rankLines = [];
          }
        });
      }
    });
    
    // Join button
    const joinBtn = this.add.rectangle(centerX, centerY + 60, 200, 50, 0x2e7d32)
      .setInteractive({ useHandCursor: true });
    const joinText = this.add.text(centerX, centerY + 60, 'Join Session', { 
      fontFamily: 'Arial Black', 
      fontSize: 24, 
      color: '#ffffff' 
    }).setOrigin(0.5);
    
    joinBtn.on('pointerdown', async () => {
      const code = inputText.text.trim();
      if (code.length !== 6 || !/^\d+$/.test(code)) {
        alert('Please enter a valid 6-digit code');
        return;
      }
      
      const session = await SessionManager.getSession(code);
      if (!session) {
        alert('Session not found');
        return;
      }
      
      // Set game settings from session
      GameSettings.setAllowed(session.config.allowedOps || ['+', '-', '×', '÷']);
      GameSettings.setRoomsPerLevel(session.config.roomsPerLevel || 6);
      
      // Start the game
      this.scene.start('GameScene');
    });
    
    // Cleanup on scene shutdown
    this.events.on('shutdown', () => {
      if (this.currentSessionCode) {
        SessionManager.unsubscribeFromSession(this.currentSessionCode);
      }
    });
  }
}
```

## Key Changes

1. **Import SessionManagerFirebase** instead of regular SessionManager
2. **Subscribe to session** when code is entered - leaderboard updates automatically
3. **Unsubscribe on cleanup** to prevent memory leaks
4. **Real-time updates** - no need to poll or refresh

## Benefits

- ✅ Leaderboards update instantly when students finish
- ✅ No polling needed - saves bandwidth
- ✅ Works across multiple devices/browsers
- ✅ Better user experience

