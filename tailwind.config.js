/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#FF1493',
        'space-bg': '#050510',
        'deep-purple': '#7C3AED',
        'danger-red': '#FF3B5C',
        'neon-cyan': '#00F0FF',
        'neon-amber': '#FFB800',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

