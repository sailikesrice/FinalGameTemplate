/**
 * Session Manager with Firebase support
 * This version uses FirebaseDatabaseManager instead of the text file approach
 * Provides real-time leaderboard updates
 */

import { FirebaseDatabaseManager } from './FirebaseDatabaseManager';

export const SessionManagerFirebase = {
  sessions: new Map(),
  initialized: false,
  subscriptions: new Map(), // Track Firebase subscriptions

  /**
   * Initialize database connection
   */
  async init() {
    if (this.initialized) return;
    await FirebaseDatabaseManager.init();
    // Load all sessions from database into memory
    const dbSessions = await FirebaseDatabaseManager.getAllSessions();
    for (const [code, session] of dbSessions.entries()) {
      this.sessions.set(code, session);
    }
    this.initialized = true;
  },

  /**
   * Ensure database is initialized
   */
  async ensureInit() {
    if (!this.initialized) {
      await this.init();
    }
  },

  /**
   * Create a new session
   */
  async createSession(config) {
    await this.ensureInit();
    const code = await this.generateCode();
    const session = { config, results: [], timestamp: Date.now() };
    this.sessions.set(code, session);
    // Save to Firebase
    await FirebaseDatabaseManager.saveSession(code, session);
    return code;
  },

  /**
   * Get a session (from cache or database)
   */
  async getSession(code) {
    await this.ensureInit();
    // First check in-memory cache
    if (this.sessions.has(code)) {
      return this.sessions.get(code);
    }
    // If not in memory, check Firebase
    const session = await FirebaseDatabaseManager.getSession(code);
    if (session) {
      this.sessions.set(code, session);
      return session;
    }
    return null;
  },

  /**
   * Add a result to a session
   */
  async addResult(code, result) {
    await this.ensureInit();
    const s = await this.getSession(code);
    if (!s) return false;
    s.results.push({ ...result, ts: Date.now() });
    // sort by elapsed ascending
    s.results.sort((a, b) => (a.elapsedMs||0) - (b.elapsedMs||0));
    // Update in memory
    this.sessions.set(code, s);
    // Save to Firebase (this will trigger real-time updates for subscribers)
    await FirebaseDatabaseManager.saveSession(code, s);
    return true;
  },

  /**
   * Subscribe to real-time updates for a session
   * Use this in StudentLobby to update leaderboards automatically
   * 
   * @param {string} code - Session code
   * @param {function} callback - Called when session data changes
   */
  subscribeToSession(code, callback) {
    // Unsubscribe from previous listener if exists
    if (this.subscriptions.has(code)) {
      this.unsubscribeFromSession(code);
    }
    
    const unsubscribe = FirebaseDatabaseManager.subscribeToSession(code, (session) => {
      if (session) {
        // Update in-memory cache
        this.sessions.set(code, session);
        // Call the callback with updated session
        callback(session);
      } else {
        callback(null);
      }
    });
    
    this.subscriptions.set(code, unsubscribe);
  },

  /**
   * Unsubscribe from session updates
   */
  unsubscribeFromSession(code) {
    if (this.subscriptions.has(code)) {
      this.subscriptions.get(code)();
      this.subscriptions.delete(code);
    }
    FirebaseDatabaseManager.unsubscribeFromSession(code);
  },

  /**
   * Generate a unique 6-digit session code
   */
  async generateCode() {
    let code;
    let attempts = 0;
    const maxAttempts = 100;
    do {
      code = String(Math.floor(100000 + Math.random() * 900000));
      attempts++;
      // Check both in-memory and Firebase to avoid duplicates
      if (attempts >= maxAttempts) {
        console.error('Failed to generate unique session code after', maxAttempts, 'attempts');
        break;
      }
    } while (this.sessions.has(code) || await FirebaseDatabaseManager.getSession(code));
    return code;
  },

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
    FirebaseDatabaseManager.cleanup();
  }
};

