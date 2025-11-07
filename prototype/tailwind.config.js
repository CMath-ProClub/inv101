/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",
    "./**/*.js",
    "!./node_modules/**",
    "!./tests/**",
    "!./dist/**"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette
        'primary-green': '#1dd1a1',
        'primary-red': '#ff3b5c',
        'primary-purple': '#6c5ce7',
        'primary-cyan': '#00d4ff',
        'primary-yellow': '#ffc15e',
        'primary-orange': '#f7931a',
        'primary-gray': '#969696',
        
        // Theme colors
        'emerald': {
          dark: '#0a4d3c',
          DEFAULT: '#1dd1a1',
          light: '#7effd4'
        },
        'quantum': {
          dark: '#4a148c',
          DEFAULT: '#6c5ce7',
          light: '#b39ddb'
        },
        'copper': {
          dark: '#8b4513',
          DEFAULT: '#cd853f',
          light: '#daa520'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Monaco', 'Consolas', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 20px rgba(0, 0, 0, 0.15)',
        'lg-green': '0 10px 25px rgba(29, 209, 161, 0.3)',
        'lg-purple': '0 10px 25px rgba(108, 92, 231, 0.3)',
        'lg-red': '0 10px 25px rgba(255, 59, 92, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: [],
}
