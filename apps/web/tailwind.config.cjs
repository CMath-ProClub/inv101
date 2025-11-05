const { fontFamily } = require("tailwindcss/defaultTheme");

const withOpacityValue = (variable) => ({ opacityValue }) => {
  if (opacityValue !== undefined) {
    return `rgb(var(${variable}) / ${opacityValue})`;
  }
  return `rgb(var(${variable}) / 1)`;
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6f6ff",
          100: "#bee4ff",
          200: "#94d0ff",
          300: "#6bbcff",
          400: "#429ef7",
          500: "#1c82e6",
          600: "#1165c1",
          700: "#0a4a96",
          800: "#06306a",
          900: "#031e48",
        },
        surface: {
          base: withOpacityValue("--surface-base"),
          elevated: withOpacityValue("--surface-elevated"),
          card: withOpacityValue("--surface-card"),
          muted: withOpacityValue("--surface-muted"),
        },
        outline: withOpacityValue("--outline-color"),
        text: {
          primary: withOpacityValue("--text-primary"),
          secondary: withOpacityValue("--text-secondary"),
          muted: withOpacityValue("--text-muted"),
        },
        accent: {
          primary: withOpacityValue("--accent-primary"),
          secondary: withOpacityValue("--accent-secondary"),
          tertiary: withOpacityValue("--accent-tertiary"),
        },
      },
      fontFamily: {
        sans: ["'InterVariable'", ...fontFamily.sans],
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(66, 158, 247, 0.45)",
        card: "0 18px 34px -20px rgba(13, 36, 54, 0.45)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
