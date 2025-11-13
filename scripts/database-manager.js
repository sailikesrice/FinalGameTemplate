/**
 * Simple Node.js utility script to manage the database.txt file
 * Usage:
 *   node scripts/database-manager.js list              - List all sessions
 *   node scripts/database-manager.js add CODE OPS ROOMS - Add a session
 *   node scripts/database-manager.js remove CODE        - Remove a session
 *   node scripts/database-manager.js clear              - Clear all sessions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATABASE_FILE = path.join(__dirname, '..', 'public', 'database.txt');

/**
 * Parse database file
 */
function parseDatabaseFile(text) {
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
}

/**
 * Format sessions to database file content
 */
function formatDatabaseFile(sessions) {
  let content = '# Math Dungeon Session Database\n';
  content += '# Format: CODE|allowedOps|roomsPerLevel|timestamp|results\n';
  content += '# Example: 123456|+,-,×|6|1234567890|[]\n\n';
  
  const sortedSessions = Array.from(sessions.entries()).sort((a, b) => {
    return (b[1].timestamp || 0) - (a[1].timestamp || 0);
  });
  
  for (const [code, session] of sortedSessions) {
    const { config, results = [], timestamp = Date.now() } = session;
    const allowedOps = (config?.allowedOps || []).join(',');
    const roomsPerLevel = config?.roomsPerLevel || 6;
    content += `${code}|${allowedOps}|${roomsPerLevel}|${timestamp}|${JSON.stringify(results)}\n`;
  }
  
  return content;
}

/**
 * Read database file
 */
function readDatabase() {
  try {
    if (fs.existsSync(DATABASE_FILE)) {
      const text = fs.readFileSync(DATABASE_FILE, 'utf-8');
      return parseDatabaseFile(text);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  return new Map();
}

/**
 * Write database file
 */
function writeDatabase(sessions) {
  try {
    const content = formatDatabaseFile(sessions);
    fs.writeFileSync(DATABASE_FILE, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

/**
 * List all sessions
 */
function listSessions() {
  const sessions = readDatabase();
  if (sessions.size === 0) {
    console.log('No sessions found in database.');
    return;
  }
  
  console.log(`\nFound ${sessions.size} session(s):\n`);
  const sorted = Array.from(sessions.entries()).sort((a, b) => {
    return (b[1].timestamp || 0) - (a[1].timestamp || 0);
  });
  
  for (const [code, session] of sorted) {
    const { config, results = [], timestamp } = session;
    const date = new Date(timestamp).toLocaleString();
    console.log(`Code: ${code}`);
    console.log(`  Operations: ${config?.allowedOps?.join(', ') || 'All'}`);
    console.log(`  Rooms per level: ${config?.roomsPerLevel || 6}`);
    console.log(`  Results: ${results.length}`);
    console.log(`  Created: ${date}`);
    console.log('');
  }
}

/**
 * Add a session
 */
function addSession(code, ops, rooms) {
  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    console.error('Error: Code must be a 6-digit number');
    return false;
  }
  
  const sessions = readDatabase();
  if (sessions.has(code)) {
    console.error(`Error: Session code ${code} already exists`);
    return false;
  }
  
  const allowedOps = ops ? ops.split(',').map(op => op.trim()) : ['+', '-', '×', '÷'];
  const roomsPerLevel = rooms ? parseInt(rooms, 10) : 6;
  
  sessions.set(code, {
    config: { allowedOps, roomsPerLevel },
    results: [],
    timestamp: Date.now()
  });
  
  if (writeDatabase(sessions)) {
    console.log(`Session ${code} added successfully`);
    return true;
  }
  return false;
}

/**
 * Remove a session
 */
function removeSession(code) {
  const sessions = readDatabase();
  if (!sessions.has(code)) {
    console.error(`Error: Session code ${code} not found`);
    return false;
  }
  
  sessions.delete(code);
  
  if (writeDatabase(sessions)) {
    console.log(`Session ${code} removed successfully`);
    return true;
  }
  return false;
}

/**
 * Clear all sessions
 */
function clearSessions() {
  const sessions = new Map();
  if (writeDatabase(sessions)) {
    console.log('All sessions cleared');
    return true;
  }
  return false;
}

// Main command handling
const command = process.argv[2];

switch (command) {
  case 'list':
    listSessions();
    break;
    
  case 'add':
    const code = process.argv[3];
    const ops = process.argv[4];
    const rooms = process.argv[5];
    if (!code) {
      console.error('Usage: node scripts/database-manager.js add CODE [OPS] [ROOMS]');
      console.error('Example: node scripts/database-manager.js add 123456 "+,-,×" 6');
      process.exit(1);
    }
    addSession(code, ops, rooms);
    break;
    
  case 'remove':
    const removeCode = process.argv[3];
    if (!removeCode) {
      console.error('Usage: node scripts/database-manager.js remove CODE');
      process.exit(1);
    }
    removeSession(removeCode);
    break;
    
  case 'clear':
    clearSessions();
    break;
    
  default:
    console.log('Math Dungeon Database Manager');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/database-manager.js list              - List all sessions');
    console.log('  node scripts/database-manager.js add CODE OPS ROOMS - Add a session');
    console.log('  node scripts/database-manager.js remove CODE        - Remove a session');
    console.log('  node scripts/database-manager.js clear              - Clear all sessions');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/database-manager.js add 123456 "+,-,×,÷" 6');
    console.log('  node scripts/database-manager.js remove 123456');
    break;
}

