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
                        /* BLACK HOLE THEME - Pure Black */
                        background: 'var(--background)',
                        foreground: 'var(--foreground)',
                        
                        /* Card - Deep Black */
                        card: {
                                DEFAULT: 'var(--card)',
                                foreground: 'var(--card-foreground)'
                        },
                        
                        /* Popover */
                        popover: {
                                DEFAULT: 'var(--popover)',
                                foreground: 'var(--popover-foreground)'
                        },
                        
                        /* Primary - Orange (Black hole glow) */
                        primary: {
                                DEFAULT: 'var(--primary)',
                                foreground: 'var(--primary-foreground)'
                        },
                        
                        /* Secondary - Dark Black */
                        secondary: {
                                DEFAULT: 'var(--secondary)',
                                foreground: 'var(--secondary-foreground)'
                        },
                        
                        /* Muted */
                        muted: {
                                DEFAULT: 'var(--muted)',
                                foreground: 'var(--muted-foreground)'
                        },
                        
                        /* Accent - Amber */
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
                        
                        /* Chart Colors - Orange palette */
                        chart: {
                                '1': 'var(--chart-1)',
                                '2': 'var(--chart-2)',
                                '3': 'var(--chart-3)',
                                '4': 'var(--chart-4)',
                                '5': 'var(--chart-5)'
                        },

                        /* BLACK HOLE Custom Colors */
                        'neon-orange': '#ff6b35',
                        'neon-amber': '#f59e0b',
                        'black-hole': '#000000',
                        'deep-space': '#050508',
                        'dark-surface': '#0a0a0a',
                        'dark-card': '#111111',
                        'glass-bg': 'rgba(0, 0, 0, 0.85)',
                        'glow-orange': 'rgba(255, 107, 53, 0.4)',
                        'glow-amber': 'rgba(245, 158, 11, 0.3)',
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
                        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.25)',
                        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
                        'glow-orange-intense': '0 0 30px rgba(255, 107, 53, 0.7), 0 0 60px rgba(255, 107, 53, 0.4)',
                        'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px rgba(0, 0, 0, 0.5)',
                        'black-hole': '0 0 50px rgba(255, 107, 53, 0.3), inset 0 0 100px rgba(0, 0, 0, 0.8)',
                },
                backgroundImage: {
                        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                        'gradient-blackhole': 'linear-gradient(135deg, #ff6b35 0%, #f59e0b 50%, #fb923c 100%)',
                        'gradient-orange': 'linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%)',
                        'gradient-amber': 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                        'blackhole-bg': "url('/black-hole-bg.jpg')",
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
                                '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.4)' },
                                '50%': { boxShadow: '0 0 35px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.3)' },
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
