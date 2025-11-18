import type { Config } from "tailwindcss";
import aspectRatio from "@tailwindcss/aspect-ratio";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Added just in case
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Added just in case
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a', // Slate 900
          primary: '#1e293b', // Slate 800
          accent: '#d97706', // Amber 600 (Gold-like)
          accentHover: '#b45309', // Amber 700
          light: '#f8fafc', // Slate 50
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    aspectRatio,
    forms,
    typography,
  ],
};
export default config;