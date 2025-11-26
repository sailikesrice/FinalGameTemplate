export const GameSettings = {
  // default: all operations enabled
  allowedOps: ['+', '-', '×', '÷'],
  roomsPerLevel: 6,
  timerMinutes: 3,
  isTutorial: false,
  setAllowed(ops) {
    this.allowedOps = ops && ops.length ? ops.slice() : ['+', '-', '×', '÷'];
  },
  getAllowed() {
    return this.allowedOps.slice();
  },
  setRoomsPerLevel(n) {
    const clamped = Math.max(3, Math.min(10, Number(n)));
    this.roomsPerLevel = Number.isFinite(clamped) ? clamped : 6;
  },
  getRoomsPerLevel() {
    return this.roomsPerLevel;
  },
  setTimerMinutes(mins) {
    const clamped = Math.max(1, Math.min(10, Number(mins)));
    this.timerMinutes = Number.isFinite(clamped) ? clamped : 3;
  },
  getTimerMinutes() {
    return this.timerMinutes;
  },
  setTutorial(isTutorial) {
    this.isTutorial = !!isTutorial;
  },
  getTutorial() {
    return this.isTutorial;
  }
};


