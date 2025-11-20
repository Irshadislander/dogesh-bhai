/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563eb",
          teal: "#14b8a6",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
