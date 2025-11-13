import type { Config } from "tailwindcss";
// Fix: Use ES module imports for Tailwind CSS plugins instead of `require` to make the file valid TypeScript.
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
