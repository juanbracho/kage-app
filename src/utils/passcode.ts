/**
 * Passcode Security Utilities
 * Provides secure passcode encryption, validation, and management
 */

// Simple hash function for passcode encryption (production-ready)
const simpleHash = async (passcode: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate a random salt for the device
export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Encrypt a passcode with salt
export const encryptPasscode = async (passcode: string, salt: string): Promise<string> => {
  if (!/^\d{4}$/.test(passcode)) {
    throw new Error('Passcode must be exactly 4 digits');
  }
  return await simpleHash(passcode, salt);
};

// Validate passcode against stored hash
export const validatePasscode = async (
  inputPasscode: string, 
  storedHash: string, 
  salt: string
): Promise<boolean> => {
  if (!/^\d{4}$/.test(inputPasscode)) {
    return false;
  }
  
  try {
    const inputHash = await encryptPasscode(inputPasscode, salt);
    return inputHash === storedHash;
  } catch (error) {
    console.error('Passcode validation error:', error);
    return false;
  }
};

// Auto-lock timeout options
export type AutoLockTimeout = '1min' | '5min' | '15min' | '30min' | 'never';

export const getAutoLockTimeoutMs = (timeout: AutoLockTimeout): number => {
  switch (timeout) {
    case '1min': return 60 * 1000;
    case '5min': return 5 * 60 * 1000;
    case '15min': return 15 * 60 * 1000;
    case '30min': return 30 * 60 * 1000;
    case 'never': return -1; // Never auto-lock
    default: return 5 * 60 * 1000; // Default 5 minutes
  }
};

// Check if passcode is valid format
export const isValidPasscode = (passcode: string): boolean => {
  return /^\d{4}$/.test(passcode);
};

// Generate a random 4-digit passcode (for demo/testing purposes only)
export const generateDemoPasscode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export interface PasscodeSettings {
  enabled: boolean;
  hash?: string;
  salt?: string;
  autoLockTimeout: AutoLockTimeout;
  lastAccessTime?: number;
}

export const defaultPasscodeSettings: PasscodeSettings = {
  enabled: false,
  autoLockTimeout: '5min',
};