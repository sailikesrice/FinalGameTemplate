/**
 * Firebase Firestore database manager for teacher and student session codes
 * Replaces the text file/localStorage approach with cloud database
 * Provides real-time updates for leaderboards
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  query,
  getDocs
} from 'firebase/firestore';
// Get Firebase config - prioritize environment variables (for Vercel), fallback to config file
import { firebaseConfig as configFile } from '../../config/firebaseConfig.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configFile.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configFile.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configFile.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configFile.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configFile.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configFile.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection name in Firestore
const SESSIONS_COLLECTION = 'sessions';

export const FirebaseDatabaseManager = {
  initialized: false,
  listeners: new Map(), // Track real-time listeners

  /**
   * Initialize Firebase connection
   */
  async init() {
    if (this.initialized) return true;
    try {
      // Test connection by trying to read from Firestore
      const testQuery = query(collection(db, SESSIONS_COLLECTION));
      await getDocs(testQuery);
      this.initialized = true;
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return false;
    }
  },

  /**
   * Get all sessions from Firestore
   */
  async getAllSessions() {
    await this.ensureInit();
    try {
      const sessions = new Map();
      const q = query(collection(db, SESSIONS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        sessions.set(docSnapshot.id, this.normalizeSessionData(data));
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return new Map();
    }
  },

  /**
   * Get a specific session by code
   */
  async getSession(code) {
    await this.ensureInit();
    try {
      const sessionRef = doc(db, SESSIONS_COLLECTION, code);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const data = sessionSnap.data();
        return this.normalizeSessionData(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  /**
   * Save a session to Firestore
   */
  async saveSession(code, session) {
    await this.ensureInit();
    try {
      const sessionRef = doc(db, SESSIONS_COLLECTION, code);
      const normalized = this.normalizeSessionData(session);
      await setDoc(sessionRef, {
        config: normalized.config,
        results: normalized.results,
        timestamp: normalized.timestamp,
        updatedAt: Date.now(),
        students: normalized.students,
        status: normalized.status,
        startTime: normalized.startTime,
        points: normalized.points,
        currentLevel: normalized.currentLevel
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  },

  /**
   * Delete a session
   */
  async deleteSession(code) {
    await this.ensureInit();
    try {
      const sessionRef = doc(db, SESSIONS_COLLECTION, code);
      await deleteDoc(sessionRef);
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  },

  /**
   * Subscribe to real-time updates for a session
   * This is the key feature - leaderboards update automatically!
   * 
   * @param {string} code - Session code
   * @param {function} callback - Called whenever session data changes
   * @returns {function} Unsubscribe function
   */
  subscribeToSession(code, callback) {
    this.ensureInit();
    
    // Remove existing listener for this code if any
    if (this.listeners.has(code)) {
      this.listeners.get(code)();
      this.listeners.delete(code);
    }
    
    try {
      const sessionRef = doc(db, SESSIONS_COLLECTION, code);
      const unsubscribe = onSnapshot(sessionRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const session = this.normalizeSessionData(data);
          callback(session);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error in session subscription:', error);
        callback(null);
      });
      
      // Store unsubscribe function
      this.listeners.set(code, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to session:', error);
      return () => {}; // Return no-op function
    }
  },

  /**
   * Unsubscribe from session updates
   */
  unsubscribeFromSession(code) {
    if (this.listeners.has(code)) {
      this.listeners.get(code)();
      this.listeners.delete(code);
    }
  },

  /**
   * Clean up all listeners
   */
  cleanup() {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  },

  /**
   * Ensure Firebase is initialized
   */
  async ensureInit() {
    if (!this.initialized) {
      await this.init();
    }
  },

  normalizeSessionData(data = {}) {
    return {
      config: data.config || { allowedOps: [], roomsPerLevel: 6 },
      results: data.results || [],
      timestamp: data.timestamp || Date.now(),
      students: data.students || [],
      status: data.status || 'waiting',
      startTime: data.startTime || null,
      points: data.points || {},
      currentLevel: data.currentLevel || 1
    };
  }
};

