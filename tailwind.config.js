/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        retro: {
          black: '#0a0a0a',
          dark: '#1a1a2e',
          mid: '#16213e',
          accent: '#0f3460',
          cyan: '#00fff5',
          magenta: '#ff00e4',
          green: '#39ff14',
          yellow: '#ffe600',
          orange: '#ff6600',
          red: '#ff073a',
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 255, 245, 0.3)',
        'pixel-lg': '6px 6px 0px 0px rgba(0, 255, 245, 0.2)',
        'glow-cyan': '0 0 20px rgba(0, 255, 245, 0.3), 0 0 40px rgba(0, 255, 245, 0.1)',
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.3), 0 0 40px rgba(57, 255, 20, 0.1)',
        'glow-magenta': '0 0 20px rgba(255, 0, 228, 0.3), 0 0 40px rgba(255, 0, 228, 0.1)',
      },
    },
  },
  plugins: [],
}

