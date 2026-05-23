// src/utils/helpers.js
// General-purpose utility helpers used across screens.

/**
 * Returns initials from a full name.
 * "Srilatha Reddy" → "SR"
 * "Ravinder"       → "R"
 */
export const getInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '?';
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'SM';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Returns the first word of a full name.
 * "Srilatha Reddy" → "Srilatha"
 * Falls back to "there" if name is empty.
 */
export const getFirstName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'Hii there';
  const first = fullName.trim().split(/\s+/)[0];
  return first || 'there';
};

/**
 * Returns a time-based greeting string.
 * 00–11  → "Good Morning"
 * 12–16  → "Good Afternoon"
 * 17–23  → "Good Evening"
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Formats an ISO date string or Date object to a human-readable string.
 * "2025-04-14T00:00:00.000Z" → "14 Apr 2025"
 * Falls back to the raw string if parsing fails.
 */
export const formatDate = (isoStringOrDate) => {
  try {
    const date = isoStringOrDate instanceof Date
      ? isoStringOrDate
      : new Date(isoStringOrDate);
    if (isNaN(date.getTime())) return String(isoStringOrDate);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(isoStringOrDate);
  }
};

/**
 * Returns a debounced version of fn that delays execution by `delay` ms.
 * Standard leading-edge-off, trailing-edge-on debounce.
 *
 * Usage:
 *   const debouncedSearch = debounce(handleSearch, 400);
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Converts a region key to a display label.
 * 'telangana'     → 'Telangana'
 * 'national'      → 'India'
 * 'international' → 'International'
 * 'all'           → 'All Events'
 * Anything else   → title-cased version of the input
 */
export const formatRegionLabel = (region) => {
  const map = {
    telangana:     'Telangana',
    national:      'India',
    international: 'International',
    all:           'All Events',
  };
  if (map[region]) return map[region];
  // Title-case fallback
  return String(region)
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Truncates a string to maxLength characters, appending "…" if truncated.
 * Useful for poster card titles in small spaces.
 */
export const truncate = (str, maxLength = 40) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
};