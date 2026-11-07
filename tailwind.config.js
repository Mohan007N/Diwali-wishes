/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#080817',
        'deep-purple': '#170D2B',
        'antique-gold': '#D4A64A',
        'bright-gold': '#FFD76A',
        saffron: '#FF8A24',
        magenta: '#D83B83',
        ivory: '#FFF4DD',
        muted: '#a899cc',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'Georgia', 'serif'],
        hind: ['Hind', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

