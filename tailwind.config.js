/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'sorcery-dark': '#0a0a0f',
        'sorcery-darker': '#050508',
        'sorcery-purple': '#8b5cf6',
        'sorcery-blue': '#3b82f6',
        'sorcery-glow': '#a78bfa',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 5px #a78bfa, 0 0 10px #a78bfa, 0 0 15px #a78bfa' },
          '100%': { 'box-shadow': '0 0 10px #a78bfa, 0 0 20px #a78bfa, 0 0 30px #a78bfa' },
        },
      },
    },
  },
  plugins: [],
}

