import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        /* NEXUS AI Core Colors */
                        background: 'var(--background)',
                        foreground: 'var(--foreground)',
                        
                        /* Card with glass effect */
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
                        
                        /* Accent - Electric Purple */
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
                        
                        /* Chart Colors - Cyberpunk palette */
                        chart: {
                                '1': 'var(--chart-1)',
                                '2': 'var(--chart-2)',
                                '3': 'var(--chart-3)',
                                '4': 'var(--chart-4)',
                                '5': 'var(--chart-5)'
                        },

                        /* NEXUS AI Custom Neon Colors */
                        'neon-cyan': '#00ffff',
                        'neon-purple': '#8b5cf6',
                        'electric-blue': '#06b6d4',
                        'deep-black': '#0a0a0f',
                        'dark-surface': '#13131a',
                        'glass-bg': 'rgba(20, 20, 30, 0.8)',
                        'glow-cyan': 'rgba(0, 255, 255, 0.3)',
                        'glow-purple': 'rgba(139, 92, 246, 0.3)',
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
                        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)',
                        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
                        'glow-cyan-intense': '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.3)',
                        'glow-purple-intense': '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
                        'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 10px 30px rgba(0, 0, 0, 0.3)',
                },
                backgroundImage: {
                        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                        'gradient-nexus': 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 50%, #06b6d4 100%)',
                        'gradient-cyan': 'linear-gradient(135deg, #00ffff 0%, #06b6d4 100%)',
                        'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
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
                },
                keyframes: {
                        'glow-pulse': {
                                '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' },
                                '50%': { boxShadow: '0 0 35px rgba(0, 255, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.2)' },
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
                },
                backdropBlur: {
                        xs: '2px',
                }
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
