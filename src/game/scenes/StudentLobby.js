import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { GameSettings } from '../dungeon/GameSettings';

export class StudentLobby extends Scene {
  constructor() { super('StudentLobby'); }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 120, 'Student Lobby', { fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff' }).setOrigin(0.5);
    this.add.text(centerX, centerY - 60, 'Enter Session Code', { fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff' }).setOrigin(0.5);

    const inputBg = this.add.rectangle(centerX, centerY - 20, 220, 46, 0x333333).setOrigin(0.5).setInteractive({ useHandCursor: true });
    inputBg.setStrokeStyle(2, 0x88c0ff, 1);
    const inputText = this.add.text(centerX, centerY - 20, '', { fontFamily: 'Arial Black', fontSize: 24, color: '#ffee58' }).setOrigin(0.5);
    
    // Rankings display
    const rankLabel = this.add.text(centerX, centerY + 170, 'Rankings (fastest first)', { fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff' }).setOrigin(0.5);
    this.rankLines = [];
    
    const drawRankings = async () => {
      const code = inputText.text.trim();
      if (!code || code.length !== 6) { 
        // Clear rankings if code is invalid
        if (this.rankLines) {
          this.rankLines.forEach(l => { try { l.destroy(); } catch(e) {} });
          this.rankLines = [];
        }
        return; 
      }
      const s = await SessionManager.getSession(code);
      if (!s) { 
        // Clear rankings if session not found
        if (this.rankLines) {
          this.rankLines.forEach(l => { try { l.destroy(); } catch(e) {} });
          this.rankLines = [];
        }
        return; 
      }
      // remove previous lines
      if (this.rankLines) {
        this.rankLines.forEach(l => { try { l.destroy(); } catch(e) {} });
      }
      this.rankLines = [];
      const top = (s.results || []).slice(0, 5);
      top.forEach((r, idx) => {
        const secs = Math.floor((r.elapsedMs||0)/1000);
        const m = Math.floor(secs/60), s2 = secs%60;
        const line = this.add.text(centerX, centerY + 200 + idx*22, `${idx+1}. ${r.role||'student'} - ${m}:${String(s2).padStart(2,'0')}`, { fontFamily: 'Arial', fontSize: 16, color: '#90caf9' }).setOrigin(0.5);
        this.rankLines.push(line);
      });
    };

    const join = async () => {
      const code = inputText.text.trim();
      if (!code || code.length !== 6) {
        status.setText('Please enter a 6-digit code');
        return;
      }
      const session = await SessionManager.getSession(code);
      if (!session) {
        status.setText('Invalid code');
        return;
      }
      // apply teacher config
      const cfg = session.config || {};
      if (cfg.allowedOps) GameSettings.setAllowed(cfg.allowedOps);
      if (cfg.roomsPerLevel) GameSettings.setRoomsPerLevel(cfg.roomsPerLevel);
      status.setText('Joining...');
      this.scene.start('Dungeon', { level: 1, sessionCode: code, role: 'student' });
    };

    const status = this.add.text(centerX, centerY + 110, '', { fontFamily: 'Arial Black', fontSize: 18, color: '#ef9a9a' }).setOrigin(0.5);
    const joinBg = this.add.rectangle(centerX, centerY + 50, 220, 56, 0x1565c0).setInteractive({ useHandCursor: true });
    const joinText = this.add.text(centerX, centerY + 50, 'Join', { fontFamily: 'Arial Black', fontSize: 26, color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Enable keyboard input - this is critical for typing to work
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true;
    }

    // Make the entire scene clickable to ensure canvas gets focus
    // This helps ensure keyboard input works
    this.input.on('pointerdown', () => {
      // Ensure keyboard is enabled when clicking anywhere
      if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
      }
      // Try to focus the canvas element
      try {
        const canvas = this.game.canvas;
        if (canvas && canvas.focus) {
          canvas.focus();
        }
      } catch (e) {
        // Canvas focus might not be available in all browsers
      }
    });

    // Handle input area clicks - just highlight it
    inputBg.on('pointerdown', () => {
      inputBg.setStrokeStyle(2, 0x88c0ff, 1);
      // Ensure keyboard is enabled
      if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
      }
    });

    // Handle numeric input - always active when scene is shown
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key;
      
      // Handle backspace
      if (key === 'Backspace') {
        inputText.setText(inputText.text.slice(0, -1));
        this.time.delayedCall(100, () => drawRankings());
        return;
      }
      
      // Handle Enter key
      if (key === 'Enter') {
        join();
        return;
      }
      
      // Handle numeric input (0-9)
      if (key >= '0' && key <= '9' && inputText.text.length < 6) {
        inputText.setText(inputText.text + key);
        inputBg.setStrokeStyle(2, 0x88c0ff, 1);
        this.time.delayedCall(100, () => drawRankings());
      }
    });

    // Join button handlers
    joinBg.on('pointerdown', () => {
      join();
    });
    joinText.on('pointerdown', () => {
      join();
    });

    // Visual feedback on hover
    inputBg.on('pointerover', () => {
      inputBg.setStrokeStyle(2, 0x88c0ff, 1);
    });
    inputBg.on('pointerout', () => {
      inputBg.setStrokeStyle(2, 0x88c0ff, 1);
    });

    // Focus the input area when scene loads
    this.time.delayedCall(200, () => {
      inputBg.setStrokeStyle(2, 0x88c0ff, 1);
      // Try to ensure keyboard focus
      if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
      }
      // Check if there's already a code in localStorage and populate it
      drawRankings();
    });
  }
}


