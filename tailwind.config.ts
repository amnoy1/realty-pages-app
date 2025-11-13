import type { Config } from "tailwindcss";

// Fix: Use import for Tailwind plugins in a TypeScript configuration file to avoid 'require is not defined' errors.
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
