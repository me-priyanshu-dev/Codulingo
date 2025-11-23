/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        duo: {
          bg: 'var(--bg)',
          card: 'var(--card)',
          green: 'var(--green)',
          'green-dark': 'var(--green-dark)',
          blue: 'var(--blue)',
          'blue-accent': 'var(--blue-accent)',
          'blue-dark': 'var(--blue-dark)',
          red: 'var(--red)',
          'red-dark': 'var(--red-dark)',
          yellow: 'var(--yellow)',
          'yellow-dark': 'var(--yellow-dark)',
          gray: 'var(--gray)',
          'gray-light': 'var(--gray-light)',
          text: 'var(--text)',
          'text-sub': 'var(--text-sub)'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        fredoka: ['Fredoka', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 3s ease-in-out infinite',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        'shake': {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
}