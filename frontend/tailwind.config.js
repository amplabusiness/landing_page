/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Contta - Inteligencia Fiscal
        contta: {
          50: '#e6f4fa',
          100: '#cce9f5',
          200: '#99d3eb',
          300: '#66bde1',
          400: '#33a7d7',
          500: '#0077B6', // Azul principal Contta
          600: '#006092',
          700: '#00486d',
          800: '#003049',
          900: '#001824',
        },
        primary: {
          50: '#e6f4fa',
          100: '#cce9f5',
          200: '#90E0EF', // Azul claro
          300: '#48CAE4',
          400: '#00B4D8',
          500: '#0077B6', // Azul principal
          600: '#023E8A', // Azul escuro
          700: '#03045E', // Azul profundo
          800: '#001845',
          900: '#000814',
        },
        accent: {
          50: '#fff3e6',
          100: '#ffe6cc',
          200: '#ffcc99',
          300: '#ffb366',
          400: '#ff9933',
          500: '#E85D04', // Laranja destaque
          600: '#DC2F02',
          700: '#D00000',
          800: '#9D0208',
          900: '#6A040F',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#6C757D', // Cinza Contta
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
