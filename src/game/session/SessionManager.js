export const SessionManager = {
  sessions: new Map(),

  createSession(config) {
    const code = this.generateCode();
    this.sessions.set(code, { config, results: [] });
    return code;
  },

  getSession(code) {
    return this.sessions.get(code) || null;
  },

  addResult(code, result) {
    const s = this.sessions.get(code);
    if (!s) return false;
    s.results.push({ ...result, ts: Date.now() });
    // sort by elapsed ascending
    s.results.sort((a, b) => (a.elapsedMs||0) - (b.elapsedMs||0));
    return true;
  },

  generateCode() {
    let code;
    do {
      code = String(Math.floor(100000 + Math.random() * 900000));
    } while (this.sessions.has(code));
    return code;
  }
};


