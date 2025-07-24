/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    {
      pattern:
        /text-(red|gray|blue|green|yellow|purple)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
