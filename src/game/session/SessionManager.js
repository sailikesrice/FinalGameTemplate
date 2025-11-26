import { FirebaseDatabaseManager as DatabaseManager } from './FirebaseDatabaseManager';

export const SessionManager = {
  sessions: new Map(),
  initialized: false,

  normalizeSession(session = {}) {
    return {
      config: session.config || { allowedOps: ['+', '-', '×', '÷'], roomsPerLevel: 6 },
      results: session.results || [],
      timestamp: session.timestamp || Date.now(),
      students: session.students || [],
      status: session.status || 'waiting',
      startTime: session.startTime || null,
      points: session.points || {},
      currentLevel: session.currentLevel || 1
    };
  },

  /**
   * Initialize database connection
   */
  async init() {
    if (this.initialized) return;
    await DatabaseManager.init();
    // Load all sessions from database into memory
    const dbSessions = await DatabaseManager.getAllSessions();
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
    const code = await this.generateCode();
    const session = this.normalizeSession({
      config,
      results: [],
      timestamp: Date.now(),
      status: 'waiting',
      students: [],
      points: {},
      currentLevel: 1,
      startTime: null
    });
    this.sessions.set(code, session);
    // Save to database
    await DatabaseManager.saveSession(code, session);
    return code;
  },

  async getSession(code) {
    await this.ensureInit();
    // First check in-memory cache
    if (this.sessions.has(code)) {
      return this.sessions.get(code);
    }
    // If not in memory, check database
    const session = await DatabaseManager.getSession(code);
    if (session) {
      const normalized = this.normalizeSession(session);
      this.sessions.set(code, normalized);
      return normalized;
    }
    return null;
  },

  async updateSession(code, updater) {
    await this.ensureInit();
    const session = await this.getSession(code);
    if (!session) return null;
    const updated = this.normalizeSession(await updater({ ...session }));
    this.sessions.set(code, updated);
    await DatabaseManager.saveSession(code, updated);
    return updated;
  },

  async addStudent(code, studentName) {
    return this.updateSession(code, (session) => {
      const students = session.students || [];
      if (!students.find((s) => s.name === studentName)) {
        students.push({
          name: studentName,
          joinedAt: Date.now()
        });
      }
      session.students = students;
      session.points = session.points || {};
      if (session.points[studentName] == null) {
        session.points[studentName] = 0;
      }
      return session;
    });
  },

  async setSessionStatus(code, status, extras = {}) {
    return this.updateSession(code, (session) => {
      session.status = status;
      if (extras.startTime !== undefined) {
        session.startTime = extras.startTime;
      }
      if (extras.currentLevel !== undefined) {
        session.currentLevel = extras.currentLevel;
      }
      return session;
    });
  },

  async addPoints(code, studentName, points) {
    return this.updateSession(code, (session) => {
      session.points = session.points || {};
      session.points[studentName] = (session.points[studentName] || 0) + points;
      return session;
    });
  },

  async addResult(code, result) {
    const updated = await this.updateSession(code, (session) => {
      session.results = session.results || [];
      session.results.push({ ...result, ts: Date.now() });
      session.results.sort((a, b) => {
        const pointsDiff = (b.points || 0) - (a.points || 0);
        if (pointsDiff !== 0) return pointsDiff;
        return (a.elapsedMs || 0) - (b.elapsedMs || 0);
      });
      return session;
    });
    return !!updated;
  },

  async generateCode() {
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
    } while (this.sessions.has(code) || await DatabaseManager.getSession(code));
    return code;
  },

  /**
   * Subscribe to real-time updates for a session
   * Use this in StudentLobby to update leaderboards automatically
   * 
   * @param {string} code - Session code
   * @param {function} callback - Called when session data changes
   */
  subscribeToSession(code, callback) {
    return DatabaseManager.subscribeToSession(code, (session) => {
      if (session) {
        // Update in-memory cache
        this.sessions.set(code, session);
        // Call the callback with updated session
        callback(session);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Unsubscribe from session updates
   */
  unsubscribeFromSession(code) {
    DatabaseManager.unsubscribeFromSession(code);
  }
};


