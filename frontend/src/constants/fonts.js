// src/constants/fonts.js
// Reference constants only — no screen imports from this file to function.
// The global Inter font is applied via Text.defaultProps in App.jsx.
// Use these constants when you need to specify a specific weight inline:
//
//   style={{ fontFamily: FONTS.bold }}
//
// Most screens apply fontFamily directly as a string for clarity,
// but this file centralises the exact family names to avoid typos.

export const FONTS = {
  regular:   'Inter-Regular',
  semiBold:  'Inter-SemiBold',
  bold:      'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
};