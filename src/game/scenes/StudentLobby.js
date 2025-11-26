import { Scene } from 'phaser';
import Phaser from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { GameSettings } from '../dungeon/GameSettings';
import { ButtonBuilder } from '../utils/ButtonBuilder';
import { CardBuilder } from '../utils/CardBuilder';

export class StudentLobby extends Scene {
  constructor() { super('StudentLobby'); }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Detect mobile for responsive layout
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 768;
    
    // Responsive sizing
    const titleFontSize = isMobile ? 32 : 40;
    const labelFontSize = isMobile ? 18 : 22;
    const inputFontSize = isMobile ? 20 : 24;
    const inputWidth = isMobile ? Math.min(this.scale.width - 40, 320) : 300;
    const inputHeight = isMobile ? 56 : 46;
    const codeInputWidth = isMobile ? Math.min(this.scale.width - 40, 240) : 220;
    
    // Adjust vertical spacing for mobile
    const titleY = isMobile ? centerY - 140 : centerY - 160;
    const nameLabelY = isMobile ? centerY - 90 : centerY - 100;
    const nameInputY = isMobile ? centerY - 50 : centerY - 60;
    const codeLabelY = isMobile ? centerY : centerY - 10;
    const codeInputY = isMobile ? centerY + 40 : centerY + 30;

    this.add.text(centerX, titleY, 'Student Lobby', { 
      fontFamily: 'Arial', 
      fontSize: titleFontSize, 
      color: '#ffffff', 
      resolution: 2 
    }).setOrigin(0.5);
    
    // Name input section - larger and more accessible on mobile
    this.add.text(centerX, nameLabelY, 'Enter Your Name', { 
      fontFamily: 'Arial', 
      fontSize: labelFontSize, 
      color: '#ffffff', 
      resolution: 2 
    }).setOrigin(0.5);
    
    const nameInputBg = this.add.rectangle(centerX, nameInputY, inputWidth, inputHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0xffee58)
      .setDepth(50)
      .setInteractive({ useHandCursor: true });
    
    const nameInputText = this.add.text(centerX, nameInputY, '', {
      fontFamily: 'Arial',
      fontSize: inputFontSize,
      color: '#ffee58',
      resolution: 2
    }).setOrigin(0.5).setDepth(51);
    
    // Session code input section - larger and more accessible on mobile
    this.add.text(centerX, codeLabelY, 'Enter Session Code', { 
      fontFamily: 'Arial', 
      fontSize: labelFontSize, 
      color: '#ffffff', 
      resolution: 2 
    }).setOrigin(0.5);
    
    const inputBg = this.add.rectangle(centerX, codeInputY, codeInputWidth, inputHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0xffee58)
      .setDepth(50)
      .setInteractive({ useHandCursor: true });
    
    const inputText = this.add.text(centerX, codeInputY, '', {
      fontFamily: 'Arial',
      fontSize: inputFontSize,
      color: '#ffee58',
      resolution: 2
    }).setOrigin(0.5).setDepth(51);
    
    // Create HTML input elements for mobile keyboard support
    const gameContainer = document.getElementById('game-container');
    if (gameContainer && isMobile) {
      // Get canvas position - use viewport coordinates for absolute positioning
      const canvas = this.game.canvas;
      const updateInputPositions = () => {
        const containerRect = gameContainer.getBoundingClientRect();
        const canvasRect = canvas ? canvas.getBoundingClientRect() : containerRect;
        
        // Calculate positions relative to viewport (absolute positioning)
        const nameInputLeft = canvasRect.left + (centerX - inputWidth / 2) * (canvasRect.width / this.scale.width);
        const nameInputTop = canvasRect.top + (nameInputY - inputHeight / 2) * (canvasRect.height / this.scale.height);
        const codeInputLeft = canvasRect.left + (centerX - codeInputWidth / 2) * (canvasRect.width / this.scale.width);
        const codeInputTop = canvasRect.top + (codeInputY - inputHeight / 2) * (canvasRect.height / this.scale.height);
        
        return { nameInputLeft, nameInputTop, codeInputLeft, codeInputTop };
      };
      
      const positions = updateInputPositions();
      
      // Name input HTML element
      const nameInputHTML = document.createElement('input');
      nameInputHTML.type = 'text';
      nameInputHTML.id = 'name-input-html';
      nameInputHTML.maxLength = 20;
      nameInputHTML.autocomplete = 'off';
      nameInputHTML.autocorrect = 'off';
      nameInputHTML.autocapitalize = 'off';
      nameInputHTML.spellcheck = false;
      nameInputHTML.style.position = 'fixed'; // Use fixed for viewport-relative positioning
      nameInputHTML.style.left = `${positions.nameInputLeft}px`;
      nameInputHTML.style.top = `${positions.nameInputTop}px`;
      nameInputHTML.style.width = `${inputWidth}px`;
      nameInputHTML.style.height = `${inputHeight}px`;
      nameInputHTML.style.backgroundColor = 'transparent';
      nameInputHTML.style.border = '2px solid #ffee58';
      nameInputHTML.style.borderRadius = '4px';
      nameInputHTML.style.color = '#ffee58';
      nameInputHTML.style.fontSize = `${inputFontSize}px`;
      nameInputHTML.style.fontFamily = 'Arial';
      nameInputHTML.style.textAlign = 'center';
      nameInputHTML.style.padding = '0';
      nameInputHTML.style.margin = '0';
      nameInputHTML.style.outline = 'none';
      nameInputHTML.style.zIndex = '10001';
      nameInputHTML.style.opacity = '0'; // Invisible but clickable
      nameInputHTML.style.pointerEvents = 'auto';
      nameInputHTML.style.caretColor = '#ffee58';
      nameInputHTML.placeholder = '';
      document.body.appendChild(nameInputHTML); // Append to body for fixed positioning
      
      // Code input HTML element
      const codeInputHTML = document.createElement('input');
      codeInputHTML.type = 'tel'; // Use 'tel' for numeric keyboard on mobile
      codeInputHTML.id = 'code-input-html';
      codeInputHTML.maxLength = 6;
      codeInputHTML.pattern = '[0-9]*';
      codeInputHTML.inputMode = 'numeric';
      codeInputHTML.autocomplete = 'off';
      codeInputHTML.style.position = 'fixed'; // Use fixed for viewport-relative positioning
      codeInputHTML.style.left = `${positions.codeInputLeft}px`;
      codeInputHTML.style.top = `${positions.codeInputTop}px`;
      codeInputHTML.style.width = `${codeInputWidth}px`;
      codeInputHTML.style.height = `${inputHeight}px`;
      codeInputHTML.style.backgroundColor = 'transparent';
      codeInputHTML.style.border = '2px solid #ffee58';
      codeInputHTML.style.borderRadius = '4px';
      codeInputHTML.style.color = '#ffee58';
      codeInputHTML.style.fontSize = `${inputFontSize}px`;
      codeInputHTML.style.fontFamily = 'Arial';
      codeInputHTML.style.textAlign = 'center';
      codeInputHTML.style.padding = '0';
      codeInputHTML.style.margin = '0';
      codeInputHTML.style.outline = 'none';
      codeInputHTML.style.zIndex = '10001';
      codeInputHTML.style.opacity = '0'; // Invisible but clickable
      codeInputHTML.style.pointerEvents = 'auto';
      codeInputHTML.style.caretColor = '#ffee58';
      codeInputHTML.placeholder = '';
      document.body.appendChild(codeInputHTML); // Append to body for fixed positioning
      
      // Sync HTML inputs with Phaser text
      const syncNameInput = () => {
        const value = nameInputHTML.value;
        nameInputText.setText(value);
        // Update border style based on focus
        if (document.activeElement === nameInputHTML) {
          nameInputHTML.style.border = '3px solid #ffee58';
          nameInputHTML.style.transform = `scale(${isMobile ? 1.02 : 1.05})`;
        } else {
          nameInputHTML.style.border = '2px solid #ffee58';
          nameInputHTML.style.transform = 'scale(1)';
        }
      };
      
      const syncCodeInput = () => {
        const value = codeInputHTML.value.replace(/\D/g, ''); // Only allow digits
        codeInputHTML.value = value; // Update the input value
        inputText.setText(value);
        // Update border style based on focus
        if (document.activeElement === codeInputHTML) {
          codeInputHTML.style.border = '3px solid #ffee58';
          codeInputHTML.style.transform = `scale(${isMobile ? 1.02 : 1.05})`;
        } else {
          codeInputHTML.style.border = '2px solid #ffee58';
          codeInputHTML.style.transform = 'scale(1)';
        }
      };
      
      // Event listeners for HTML inputs
      nameInputHTML.addEventListener('input', syncNameInput);
      nameInputHTML.addEventListener('focus', () => {
        updateActiveInput('name');
        syncNameInput();
      });
      nameInputHTML.addEventListener('blur', syncNameInput);
      
      codeInputHTML.addEventListener('input', syncCodeInput);
      codeInputHTML.addEventListener('focus', () => {
        updateActiveInput('code');
        syncCodeInput();
      });
      codeInputHTML.addEventListener('blur', syncCodeInput);
      
      // Handle Enter key on HTML inputs
      nameInputHTML.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          codeInputHTML.focus();
          e.preventDefault();
        }
      });
      
      codeInputHTML.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          join();
          e.preventDefault();
        }
      });
      
      // Store references for cleanup
      this.nameInputHTML = nameInputHTML;
      this.codeInputHTML = codeInputHTML;
      
      // Update input positions on resize
      const updateInputPositionsHandler = () => {
        if (!nameInputHTML || !codeInputHTML) return;
        
        const newCenterX = this.scale.width / 2;
        const newCenterY = this.scale.height / 2;
        const newNameInputY = isMobile ? newCenterY - 50 : newCenterY - 60;
        const newCodeInputY = isMobile ? newCenterY + 40 : newCenterY + 30;
        const newInputWidth = isMobile ? Math.min(this.scale.width - 40, 320) : 300;
        const newCodeInputWidth = isMobile ? Math.min(this.scale.width - 40, 240) : 220;
        
        const newPositions = updateInputPositions();
        const scaleX = newPositions.scaleX;
        const scaleY = newPositions.scaleY;
        
        const containerRect = gameContainer.getBoundingClientRect();
        const canvasRect = canvas ? canvas.getBoundingClientRect() : containerRect;
        
        const nameInputLeft = canvasRect.left + (newCenterX - newInputWidth / 2) * scaleX;
        const nameInputTop = canvasRect.top + (newNameInputY - inputHeight / 2) * scaleY;
        const codeInputLeft = canvasRect.left + (newCenterX - newCodeInputWidth / 2) * scaleX;
        const codeInputTop = canvasRect.top + (newCodeInputY - inputHeight / 2) * scaleY;
        
        nameInputHTML.style.left = `${nameInputLeft}px`;
        nameInputHTML.style.top = `${nameInputTop}px`;
        nameInputHTML.style.width = `${newInputWidth * scaleX}px`;
        nameInputHTML.style.height = `${inputHeight * scaleY}px`;
        nameInputHTML.style.fontSize = `${inputFontSize * scaleY}px`;
        
        codeInputHTML.style.left = `${codeInputLeft}px`;
        codeInputHTML.style.top = `${codeInputTop}px`;
        codeInputHTML.style.width = `${newCodeInputWidth * scaleX}px`;
        codeInputHTML.style.height = `${inputHeight * scaleY}px`;
        codeInputHTML.style.fontSize = `${inputFontSize * scaleY}px`;
      };
      
      this.scale.on('resize', updateInputPositionsHandler);
      
      // Also update on orientation change
      window.addEventListener('orientationchange', () => {
        setTimeout(updateInputPositionsHandler, 100);
      });
    }
    
    // Track which input is active
    let activeInput = 'name'; // 'name' or 'code'
    const updateActiveInput = (type) => {
      activeInput = type;
      const scale = isMobile ? 1.02 : 1.05;
      if (type === 'name') {
        nameInputBg.setScale(scale);
        nameInputBg.setStrokeStyle(3, 0xffee58);
        inputBg.setScale(1);
        inputBg.setStrokeStyle(2, 0xffee58);
      } else {
        nameInputBg.setScale(1);
        nameInputBg.setStrokeStyle(2, 0xffee58);
        inputBg.setScale(scale);
        inputBg.setStrokeStyle(3, 0xffee58);
      }
    };
    updateActiveInput('name');
    
    // Make input boxes clickable - focus HTML inputs on mobile
    nameInputBg.on('pointerdown', () => {
      updateActiveInput('name');
      if (isMobile && this.nameInputHTML) {
        this.nameInputHTML.focus();
        this.nameInputHTML.click();
      }
    });
    
    nameInputText.on('pointerdown', () => {
      updateActiveInput('name');
      if (isMobile && this.nameInputHTML) {
        this.nameInputHTML.focus();
        this.nameInputHTML.click();
      }
    });
    
    inputBg.on('pointerdown', () => {
      updateActiveInput('code');
      if (isMobile && this.codeInputHTML) {
        this.codeInputHTML.focus();
        this.codeInputHTML.click();
      }
    });
    
    inputText.on('pointerdown', () => {
      updateActiveInput('code');
      if (isMobile && this.codeInputHTML) {
        this.codeInputHTML.focus();
        this.codeInputHTML.click();
      }
    });
    
    const join = async () => {
      // Get values from HTML inputs if on mobile, otherwise from Phaser text
      const studentName = (isMobile && this.nameInputHTML) ? 
        this.nameInputHTML.value.trim() : nameInputText.text.trim();
      const code = (isMobile && this.codeInputHTML) ? 
        this.codeInputHTML.value.trim() : inputText.text.trim();
      
      if (!studentName || studentName.length === 0) {
        status.setText('Please enter your name');
        return;
      }
      if (studentName.length > 20) {
        status.setText('Name must be 20 characters or less');
        return;
      }
      if (!code || code.length !== 6) {
        status.setText('Please enter a 6-digit code');
        return;
      }
      const session = await SessionManager.getSession(code);
      if (!session) {
        status.setText('Invalid code');
        return;
      }
      // Store student name in registry for later use
      this.registry.set('studentName', studentName);
      // apply teacher config
      const cfg = session.config || {};
      if (cfg.allowedOps) GameSettings.setAllowed(cfg.allowedOps);
      if (cfg.roomsPerLevel) GameSettings.setRoomsPerLevel(cfg.roomsPerLevel);
      status.setText('Joining lobby...');
      await SessionManager.addStudent(code, studentName);
      this.scene.start('StudentWaitRoom', { sessionCode: code, studentName });
    };

    const status = this.add.text(centerX, centerY + 150, '', { fontFamily: 'Arial', fontSize: 18, color: '#ef9a9a', resolution: 2 }).setOrigin(0.5);
    
    // Join button
    const joinButton = ButtonBuilder.createButton(this, centerX, centerY + 90, 'Join', {
      fontSize: 26,
      onClick: join
    });

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

    // Desktop keyboard input handling (fallback for non-mobile)
    if (!isMobile && this.input.keyboard) {

      // Handle keyboard input for desktop
      this.input.keyboard.on('keydown', (event) => {
        const key = event.key;
        const keyLength = key.length;
        
        // Only process single character keys (ignore special keys like 'Shift', 'Control', etc.)
        if (keyLength > 1 && key !== 'Backspace' && key !== 'Enter' && key !== 'Tab') {
          return;
        }
        
        // Handle backspace
        if (key === 'Backspace') {
          if (activeInput === 'name') {
            nameInputText.setText(nameInputText.text.slice(0, -1));
          } else {
            inputText.setText(inputText.text.slice(0, -1));
          }
          event.preventDefault();
          return;
        }
        
        // Handle Enter key
        if (key === 'Enter') {
          join();
          event.preventDefault();
          return;
        }
        
        // Handle Tab key - switch between inputs
        if (key === 'Tab') {
          event.preventDefault();
          updateActiveInput(activeInput === 'name' ? 'code' : 'name');
          return;
        }
        
        // Handle input based on active field
        if (activeInput === 'name') {
          // Only allow letters (a-z, A-Z) and spaces for name
          if ((key >= 'a' && key <= 'z') || (key >= 'A' && key <= 'Z') || key === ' ') {
            if (nameInputText.text.length < 20) {
              nameInputText.setText(nameInputText.text + key);
            }
            event.preventDefault();
          }
        } else {
          // Handle numeric input (0-9) for session code
          if (key >= '0' && key <= '9' && inputText.text.length < 6) {
            inputText.setText(inputText.text + key);
            event.preventDefault();
          }
        }
      });
    }


    // Focus the input area when scene loads
    this.time.delayedCall(200, () => {
      updateActiveInput('name');
      // On mobile, focus the HTML input to trigger keyboard
      if (isMobile && this.nameInputHTML) {
        this.nameInputHTML.focus();
      } else if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
      }
    });

    // Back button
    ButtonBuilder.createButton(this, 80, 30, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => {
        // Clean up HTML inputs when leaving scene
        this.cleanupHTMLInputs();
        this.scene.start('RoleMenu');
      }
    });
  }
  
  // Cleanup HTML inputs
  cleanupHTMLInputs() {
    if (this.nameInputHTML) {
      if (this.nameInputHTML.parentNode) {
        this.nameInputHTML.parentNode.removeChild(this.nameInputHTML);
      }
      this.nameInputHTML = null;
    }
    if (this.codeInputHTML) {
      if (this.codeInputHTML.parentNode) {
        this.codeInputHTML.parentNode.removeChild(this.codeInputHTML);
      }
      this.codeInputHTML = null;
    }
  }
  
  // Cleanup when scene is destroyed
  destroy() {
    this.cleanupHTMLInputs();
    super.destroy();
  }
}


