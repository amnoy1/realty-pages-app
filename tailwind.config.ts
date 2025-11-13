import type { Config } from "tailwindcss";
// Fix: Use ES module imports instead of CommonJS require for Tailwind plugins to resolve TypeScript errors.
import aspectRatio from "@tailwindcss/aspect-ratio";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    aspectRatio,
    forms,
    typography,
  ],
};
export default config;
