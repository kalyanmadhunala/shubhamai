// src/utils/validators.js
// Validation helpers used across auth and form screens.

/**
 * Returns true if the string looks like a valid email.
 * Simple RFC-style check — good enough for frontend UX.
 */
export const isValidEmail = (email) =>
  /\S+@\S+\.\S+/.test(String(email).trim());

/**
 * Returns true if the string is exactly 10 digits (Indian mobile).
 */
export const isValidPhone = (phone) =>
  /^[0-9]{10}$/.test(String(phone).trim());

/**
 * Returns true if password is at least 6 characters.
 */
export const isValidPassword = (pwd) =>
  typeof pwd === 'string' && pwd.length >= 6;

/**
 * Returns true for:
 *   - Full date:  YYYY-MM-DD
 *   - Recurring:  MM-DD   (annual dates without a year)
 */
export const isValidDate = (date) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}-\d{2}$/.test(date);

/**
 * Returns true if the value is a valid email OR a valid 10-digit phone.
 * Used for "email or phone" combined identifier fields.
 */
export const isValidIdentifier = (val) =>
  isValidEmail(val) || isValidPhone(val);

/**
 * Returns true if the string is non-empty after trimming.
 */
export const isNonEmpty = (val) =>
  typeof val === 'string' && val.trim().length > 0;

/**
 * Returns true if password and confirmPassword match and both are valid.
 */
export const passwordsMatch = (pwd, confirmPwd) =>
  isValidPassword(pwd) && pwd === confirmPwd;