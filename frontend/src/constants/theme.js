// src/constants/theme.js
// Single source of truth for all design tokens.
// Import in components instead of hardcoding values.

export const THEME = {
  // ── Colors ──────────────────────────────────────────────────────────────────
  colors: {
    primary:        '#00BCD4',
    secondary:      '#0D47A1',
    background:     '#FFFFFF',
    surface:        'rgba(255,255,255,0.78)',
    textPrimary:    '#111827',
    textSecondary:  '#6B7280',
    borderGlass:    'rgba(255,255,255,0.35)',
    error:          '#EF4444',
    success:        '#10B981',
    warning:        '#F59E0B',

    // Legacy aliases (keeps existing COLORS references working)
    white:          '#FFFFFF',
    black:          '#000000',
    grey:           '#9E9E9E',
    lightGrey:      '#E0E0E0',
    darkGrey:       '#111827',
  },

  // ── Gradients ────────────────────────────────────────────────────────────────
  gradients: {
    primary:        ['#00BCD4', '#0D47A1'],
    primaryReverse: ['#0D47A1', '#00BCD4'],
    glass:          ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)'],
  },

  // ── Spacing ──────────────────────────────────────────────────────────────────
  spacing: {
    screenPad:   20,
    cardPad:     16,
    section:     24,
  },

  // ── Radii ────────────────────────────────────────────────────────────────────
  radius: {
    sm:   12,
    md:   16,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 32,
    full: 9999,
  },

  // ── Component sizes ──────────────────────────────────────────────────────────
  size: {
    buttonHeight:  56,
    inputHeight:   56,
    searchHeight:  56,
    chipHeight:    38,
    eventCardH:    92,
    headerH:       180,
    fabSize:       68,
    navHeight:     84,
    avatarSm:      40,
    avatarMd:      64,
    avatarLg:      88,
  },

  // ── Typography ───────────────────────────────────────────────────────────────
  font: {
    headingXL:  { fontSize: 34, fontFamily: 'Inter-Bold' },
    headingL:   { fontSize: 28, fontFamily: 'Inter-Bold' },
    section:    { fontSize: 22, fontFamily: 'Inter-SemiBold' },
    cardTitle:  { fontSize: 18, fontFamily: 'Inter-SemiBold' },
    body:       { fontSize: 16, fontFamily: 'Inter-Regular' },
    button:     { fontSize: 16, fontFamily: 'Inter-Medium' },
    caption:    { fontSize: 14, fontFamily: 'Inter-Regular' },
    label:      { fontSize: 14, fontFamily: 'Inter-SemiBold' },
  },

  // ── Shadows ──────────────────────────────────────────────────────────────────
  shadow: {
    card: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius:  12,
      elevation:     0,
    },
    fab: {
      shadowColor:   '#00BCD4',
      shadowOffset:  { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius:  12,
      elevation:     12,
    },
    nav: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius:  16,
      elevation:     20,
    },
    header: {
      shadowColor:   '#00BCD4',
      shadowOffset:  { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius:  20,
      elevation:     10,
    },
  },
};

export default THEME;