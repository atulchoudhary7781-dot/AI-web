import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  
  // Content paths for purging unused CSS
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  // Optimize for production
  // In Next.js 14+, this is handled automatically
  // But we can still configure important options
  
  theme: {
    extend: {
      colors: {
        /* Base Theme Colors */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        /* Card */
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        
        /* Popover */
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        
        /* Primary - Neon Cyan */
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        
        /* Secondary */
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        
        /* Muted */
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        
        /* Accent */
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        
        /* Destructive */
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: '#ffffff'
        },
        
        /* Borders & Inputs */
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        
        /* Chart Colors */
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)'
        },

        /* ==================== NEXUS AI CUSTOM COLORS ==================== */
        
        /* Primary Neon Colors - CYAN / PURPLE / ELECTRIC BLUE */
        'neon-cyan': '#00f0ff',
        'neon-purple': '#a855f7',
        'electric-blue': '#3b82f6',
        
        /* Dark Theme Backgrounds */
        'dark-bg': '#000000',
        'dark-surface': '#0a0a0f',
        'dark-card': '#111118',
        'deep-space': '#050510',
        
        /* Glass Effects */
        'glass-bg': 'rgba(10, 10, 20, 0.85)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        
        /* Glow Effects */
        'glow-cyan': 'rgba(0, 240, 255, 0.4)',
        'glow-purple': 'rgba(168, 85, 247, 0.4)',
        'glow-blue': 'rgba(59, 130, 246, 0.3)',
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-orbitron)', 'monospace'],
        display: ['var(--font-orbitron)', 'sans-serif'],
      },
      
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.25)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.15)',
        'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px rgba(0, 0, 0, 0.5)',
        'neon-intense': '0 0 30px rgba(0, 240, 255, 0.7), 0 0 60px rgba(0, 240, 255, 0.4)',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #00f0ff 0%, #a855f7 50%, #3b82f6 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
        'gradient-purple': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      },
      
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'border-glow': 'border-glow 3s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 240, 255, 0.6), 0 0 60px rgba(0, 240, 255, 0.3)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'typing': {
          '0%, 60%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '30%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  
  plugins: [tailwindcssAnimate],
};

export default config;
