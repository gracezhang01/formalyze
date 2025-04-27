
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        morandi: {
          pink: '#E0C1B3',
          green: '#B6C4A2',
          blue: '#92A5BD',
          beige: '#E2D5C3',
          gray: '#D0CFC9',
          dark: '#5A5A5A',
        },
        background: {
          light: '#FDFBF9',
          subtle: '#F5F2EF',
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'morandi': '12px',
      },
      boxShadow: {
        'morandi': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'morandi-hover': '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'gradient-shift': 'gradient 8s ease infinite',
        'fade-in': 'fadeIn 0.6s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-gentle': 'pulseGentle 2s infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        pulseGentle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 }
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-motion'),
  ],
  safelist: [
    {
      pattern: /^motion-/
    }
  ],
};
