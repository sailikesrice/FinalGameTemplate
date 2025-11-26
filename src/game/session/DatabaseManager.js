/**
 * Simple text file database manager for teacher and student session codes
 * Uses localStorage for browser persistence and syncs with database.txt file
 */

export const DatabaseManager = {
  // Storage key for localStorage
  STORAGE_KEY: 'math_dungeon_sessions',
  DATABASE_FILE: '/database.txt',

  /**
   * Initialize database - load from file if available, otherwise use localStorage
   */
  async init() {
    try {
      // Try to load from database.txt file first
      const response = await fetch(this.DATABASE_FILE);
      if (response.ok) {
        const text = await response.text();
        const sessions = this.parseDatabaseFile(text);
        if (sessions && sessions.size > 0) {
          // Merge file data with localStorage
          this.mergeWithLocalStorage(sessions);
          return true;
        }
      }
    } catch (error) {
      console.warn('Could not load database.txt, using localStorage:', error);
    }
    return false;
  },

  /**
   * Parse database.txt file content
   * Format: Each line is either:
   * - A comment starting with #
   * - A session entry: CODE|allowedOps|roomsPerLevel|timestamp
   * - Empty lines are ignored
   */
  parseDatabaseFile(text) {
    const sessions = new Map();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Parse session entry
      const parts = trimmed.split('|');
      if (parts.length >= 3) {
        const code = parts[0].trim();
        const allowedOps = parts[1].trim().split(',').filter(op => op);
        const roomsPerLevel = parseInt(parts[2].trim(), 10) || 6;
        const timestamp = parts[3] ? parseInt(parts[3].trim(), 10) : Date.now();
        const results = parts[4] ? JSON.parse(parts[4]) : [];
        
        sessions.set(code, {
          config: { allowedOps, roomsPerLevel },
          results,
          timestamp
        });
      }
    }
    
    return sessions;
  },

  /**
   * Convert sessions map to database file format
   */
  formatDatabaseFile(sessions) {
    let content = '# Math Dungeon Session Database\n';
    content += '# Format: CODE|allowedOps|roomsPerLevel|timestamp|results\n';
    content += '# Example: 123456|+,-,×|6|1234567890|[]\n\n';
    
    for (const [code, session] of sessions.entries()) {
      const { config, results = [], timestamp = Date.now() } = session;
      const allowedOps = (config?.allowedOps || []).join(',');
      const roomsPerLevel = config?.roomsPerLevel || 6;
      content += `${code}|${allowedOps}|${roomsPerLevel}|${timestamp}|${JSON.stringify(results)}\n`;
    }
    
    return content;
  },

  /**
   * Load sessions from localStorage
   */
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return new Map(parsed);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return new Map();
  },

  /**
   * Save sessions to localStorage
   */
  saveToLocalStorage(sessions) {
    try {
      const data = JSON.stringify(Array.from(sessions.entries()));
      localStorage.setItem(this.STORAGE_KEY, data);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  /**
   * Merge file sessions with localStorage sessions
   */
  mergeWithLocalStorage(fileSessions) {
    const localSessions = this.loadFromLocalStorage();
    
    // Merge: file data takes precedence for config, but keep local results
    for (const [code, fileSession] of fileSessions.entries()) {
      const localSession = localSessions.get(code);
      if (localSession && localSession.results && localSession.results.length > 0) {
        // Keep local results if they exist
        fileSessions.set(code, {
          ...fileSession,
          results: localSession.results
        });
      }
    }
    
    // Also add any local sessions not in file
    for (const [code, localSession] of localSessions.entries()) {
      if (!fileSessions.has(code)) {
        fileSessions.set(code, localSession);
      }
    }
    
    this.saveToLocalStorage(fileSessions);
  },

  /**
   * Get all sessions (from localStorage)
   */
  getAllSessions() {
    return this.loadFromLocalStorage();
  },

  /**
   * Get a specific session by code
   */
  getSession(code) {
    const sessions = this.loadFromLocalStorage();
    return sessions.get(code) || null;
  },

  /**
   * Save a session to localStorage
   */
  saveSession(code, session) {
    const sessions = this.loadFromLocalStorage();
    sessions.set(code, session);
    this.saveToLocalStorage(sessions);
    return true;
  },

  /**
   * Delete a session
   */
  deleteSession(code) {
    const sessions = this.loadFromLocalStorage();
    sessions.delete(code);
    this.saveToLocalStorage(sessions);
    return true;
  },

  /**
   * Export sessions as downloadable text file
   */
  exportToFile() {
    const sessions = this.loadFromLocalStorage();
    const content = this.formatDatabaseFile(sessions);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.txt';
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Import sessions from uploaded file
   */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const sessions = this.parseDatabaseFile(text);
          this.mergeWithLocalStorage(sessions);
          resolve(sessions.size);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};

