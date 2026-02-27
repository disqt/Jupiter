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
        running: {
          DEFAULT: '#34d399',
          glow: 'rgba(52, 211, 153, 0.15)',
          soft: '#142a22',
        },
        swimming: {
          DEFAULT: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.15)',
          soft: '#0c2a30',
        },
        walking: {
          DEFAULT: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.15)',
          soft: '#2d2410',
        },
        'custom-workout': {
          DEFAULT: '#a78bfa',
          glow: 'rgba(167, 139, 250, 0.15)',
          soft: '#1f1a2e',
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
        saveOverlayIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        saveGlow: {
          from: { opacity: '0', transform: 'scale(0.5)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        saveCircleDraw: {
          to: { 'stroke-dashoffset': '0' },
        },
        saveCheckDraw: {
          to: { 'stroke-dashoffset': '0' },
        },
        saveTextReveal: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        saveFadeOut: {
          to: { opacity: '0', transform: 'scale(0.97)' },
        },
        medalBounce: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.3)' },
          '60%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        medalFloatUp: {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-20px)' },
        },
        progressGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease',
        overlayIn: 'overlayIn 0.2s ease',
        sheetUp: 'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pulseDelete: 'pulseDelete 0.3s ease',
        saveOverlayIn: 'saveOverlayIn 300ms ease forwards',
        saveGlow: 'saveGlow 800ms ease-out 200ms both',
        saveCircleDraw: 'saveCircleDraw 700ms ease-in-out 200ms forwards',
        saveCheckDraw: 'saveCheckDraw 400ms ease-out 600ms forwards',
        saveTextReveal: 'saveTextReveal 300ms ease 800ms both',
        saveFadeOut: 'saveFadeOut 400ms ease 1500ms forwards',
        medalBounce: 'medalBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        medalFloatUp: 'medalFloatUp 0.8s ease-out forwards',
        progressGlow: 'progressGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
