/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // DevPulse color palette
                surface: {
                    DEFAULT: '#0f1117',
                    card: '#161b27',
                    hover: '#1e2535',
                    border: '#252d3d',
                },
                accent: {
                    DEFAULT: '#4f8ef7',
                    dim: '#2a4a7f',
                    green: '#2dd4a0',
                    yellow: '#f59e0b',
                    red: '#ef4444',
                    purple: '#a78bfa',
                },
                text: {
                    primary: '#e8eaf0',
                    secondary: '#8b95a8',
                    muted: '#4a5568',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.25s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
