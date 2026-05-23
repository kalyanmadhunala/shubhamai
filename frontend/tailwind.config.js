/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:   '#00BCD4',
        secondary: '#0D47A1',
        surface:   'rgba(255,255,255,0.78)',
        'text-primary':   '#111827',
        'text-secondary': '#6B7280',
        'border-glass':   'rgba(255,255,255,0.35)',
        'bg-app':  '#121212',
      },
      fontFamily: {
        regular:   ['Inter-Regular'],
        medium:    ['Inter-Medium'],
        semibold:  ['Inter-SemiBold'],
        bold:      ['Inter-Bold'],
        extrabold: ['Inter-ExtraBold'],
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '40px',
      },
    },
  },
  plugins: [],
};