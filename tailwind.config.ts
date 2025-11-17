// @ts-nocheck
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // We are making these paths more specific to our project structure (app and components)
    // to ensure the Vercel build process reliably finds all files using Tailwind classes.
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
export default config;
