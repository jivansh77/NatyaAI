/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
import forms from '@tailwindcss/forms'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        scroll: 'scroll 40s linear infinite',
        blink: 'blink 1s step-end infinite',
        'float-fast': 'float-slow 15s linear infinite',
        'float-medium': 'float-slow 20s linear infinite',
        'float-slow': 'float-slow 25s linear infinite',
        'float-reverse-fast': 'float-reverse-slow 18s linear infinite',
        'float-reverse-medium': 'float-reverse-slow 22s linear infinite',
        'float-reverse-slow': 'float-reverse-slow 28s linear infinite',
        'float-up': 'float-up 20s linear infinite',
        'float-down': 'float-down 20s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards'
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          'from, to': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'float-slow': {
          '0%': { transform: 'translateX(-100%) scale(1)' },
          '50%': { transform: 'translateX(50vw) scale(1.1)' },
          '100%': { transform: 'translateX(100vw) scale(1)' }
        },
        'float-reverse-slow': {
          '0%': { transform: 'translateX(100%) scale(1)' },
          '50%': { transform: 'translateX(-50vw) scale(1.1)' },
          '100%': { transform: 'translateX(-100vw) scale(1)' }
        },
        'float-up': {
          '0%': { transform: 'translateY(100%) translateX(0) scale(1)' },
          '50%': { transform: 'translateY(50vh) translateX(25vw) scale(1.1)' },
          '100%': { transform: 'translateY(0) translateX(0) scale(1)' }
        },
        'float-down': {
          '0%': { transform: 'translateY(0) translateX(0) scale(1)' },
          '50%': { transform: 'translateY(50vh) translateX(-25vw) scale(1.1)' },
          '100%': { transform: 'translateY(100%) translateX(0) scale(1)' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      colors: {
        deepred: '#8B0000',
        gold: '#FFD700',
        cream: '#FFFDD0',
      },
      fontFamily: {
        serif: ['Crimson Text', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {
      animation: ['hover', 'group-hover'],
    },
  },
  plugins: [
    forms,daisyui,
  ],
  daisyui: {
    themes: ["cupcake"],
  },
}
