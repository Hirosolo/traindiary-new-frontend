/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        accent: "#60a5fa",
        "background-dark": "#050505",
        "surface-dark": "#0c0c0c",
        "surface-card": "#121212",
        "surface-highlight": "#1e1e1e",
        "text-dim": "#71717a",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      letterSpacing: {
        "ultra-wide": "0.25em",
        architectural: "0.15em",
      },
    },
  },
  plugins: [],
};
