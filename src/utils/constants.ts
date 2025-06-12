// src/utils/constants.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://hms-backend-8oqn.onrender.com' 
    : 'http://localhost:8000');

const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'wss://hms-backend-8oqn.onrender.com' 
    : 'ws://localhost:8000');

// EEG Configuration
const EEG_SAMPLING_RATE = 256; // Hz
const EEG_WINDOW_SIZE = 100; // Number of data points to display

// Frequency bands (Hz)
const FREQUENCY_BANDS = {
  DELTA: { min: 0.5, max: 4 },   // Deep sleep
  THETA: { min: 4, max: 8 },     // Drowsiness, meditation
  ALPHA: { min: 8, max: 13 },    // Relaxed, closed eyes
  BETA: { min: 13, max: 30 },    // Normal alert consciousness
  GAMMA: { min: 30, max: 100 }   // Higher cognitive functions
};

// Seizure classifications
const SEIZURE_TYPES = {
  NORMAL: 1,
  FOCAL: 2,
  GENERAL: 3,
  STATUS: 4
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  TECHNICIAN: 'technician',
  RESEARCHER: 'researcher'
};

// Permissions by role
const PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
  [USER_ROLES.DOCTOR]: ['read', 'write', 'alert'],
  [USER_ROLES.TECHNICIAN]: ['read', 'alert'],
  [USER_ROLES.RESEARCHER]: ['read']
};

// Theme options
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  HIGH_CONTRAST: 'high-contrast'
};

// Export all constants
export {
  API_BASE_URL,
  WS_BASE_URL,
  EEG_SAMPLING_RATE,
  EEG_WINDOW_SIZE,
  FREQUENCY_BANDS,
  SEIZURE_TYPES,
  USER_ROLES,
  PERMISSIONS,
  THEMES
};