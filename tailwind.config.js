/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        campus: {
          ink: "#080a0d",
          surface: "#12161c",
          elevated: "#181d25",
          gold: "#f5b72f",
          amber: "#ffcf66",
          green: "#4ade80",
          moss: "#1c3a2e",
          sky: "#93c5fd"
        }
      }
    }
  },
  plugins: []
};
