import type { Config } from "tailwindcss";

// FIX: Replaced CommonJS `require()` with ES module `import` statements to resolve TypeScript errors. This is a more modern and type-safe way to include Tailwind CSS plugins.
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
