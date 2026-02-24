import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0e0f11',
          card: '#1a1b1f',
          'card-hover': '#222329',
          elevated: '#26272d',
        },
        border: '#2a2b32',
        text: {
          DEFAULT: '#f0eff4',
          secondary: '#8b8a94',
          muted: '#55545e',
        },
        cycling: {
          DEFAULT: '#3b9eff',
          glow: 'rgba(59, 158, 255, 0.15)',
          soft: '#1a2a3d',
        },
        strength: {
          DEFAULT: '#ff8a3b',
          glow: 'rgba(255, 138, 59, 0.15)',
          soft: '#2d1f14',
        },
        accent: '#a78bfa',
        danger: '#ef4444',
      },
      borderRadius: {
        card: '14px',
        sm: '10px',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        overlayIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        sheetUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        pulseDelete: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease',
        overlayIn: 'overlayIn 0.2s ease',
        sheetUp: 'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pulseDelete: 'pulseDelete 0.3s ease',
      },
    },
  },
  plugins: [],
};
export default config;
