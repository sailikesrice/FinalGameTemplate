import { DatabaseManager } from './DatabaseManager';

export const SessionManager = {
  sessions: new Map(),
  initialized: false,

  /**
   * Initialize database connection
   */
  async init() {
    if (this.initialized) return;
    await DatabaseManager.init();
    // Load all sessions from database into memory
    const dbSessions = DatabaseManager.getAllSessions();
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

  async createSession(config) {
    await this.ensureInit();
    const code = this.generateCode();
    const session = { config, results: [], timestamp: Date.now() };
    this.sessions.set(code, session);
    // Save to database
    DatabaseManager.saveSession(code, session);
    return code;
  },

  async getSession(code) {
    await this.ensureInit();
    // First check in-memory cache
    if (this.sessions.has(code)) {
      return this.sessions.get(code);
    }
    // If not in memory, check database
    const session = DatabaseManager.getSession(code);
    if (session) {
      this.sessions.set(code, session);
      return session;
    }
    return null;
  },

  async addResult(code, result) {
    await this.ensureInit();
    const s = await this.getSession(code);
    if (!s) return false;
    s.results.push({ ...result, ts: Date.now() });
    // sort by elapsed ascending
    s.results.sort((a, b) => (a.elapsedMs||0) - (b.elapsedMs||0));
    // Update in memory
    this.sessions.set(code, s);
    // Save to database
    DatabaseManager.saveSession(code, s);
    return true;
  },

  generateCode() {
    let code;
    let attempts = 0;
    const maxAttempts = 100;
    do {
      code = String(Math.floor(100000 + Math.random() * 900000));
      attempts++;
      // Check both in-memory and database to avoid duplicates
      if (attempts >= maxAttempts) {
        console.error('Failed to generate unique session code after', maxAttempts, 'attempts');
        break;
      }
    } while (this.sessions.has(code) || DatabaseManager.getSession(code));
    return code;
  }
};


