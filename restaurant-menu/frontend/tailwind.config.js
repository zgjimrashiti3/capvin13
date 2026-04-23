/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        italian: {
          green: '#006B3C',
          'green-dark': '#004d2b',
          'green-light': '#007d46',
          red: '#CE2B37',
          'red-dark': '#a01f29',
          'red-light': '#e03342',
        },
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      keyframes: {
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-slide-in': 'fadeSlideIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
