/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        surface: {
          DEFAULT: '#0F0F1A',
          2: '#16162A',
          3: '#1E1E35',
          4: '#252540',
        },
        gold: '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scanLine: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(200px)' },
        },
      },
    },
  },
  plugins: [],
}
