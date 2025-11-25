/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f2f7ff",
          100: "#e6effe",
          200: "#c0d6fd",
          300: "#99bcfb",
          400: "#4d89f8",
          500: "#0157f5",
          600: "#014ee0",
          700: "#0141bb",
          800: "#013395",
          900: "#012a79"
        }
      },
      boxShadow: {
        glow: "0 20px 45px -15px rgba(1, 87, 245, 0.6)",
        beam: "0 0 120px 30px rgba(120, 46, 255, 0.25)"
      },
      backgroundImage: {
        "magic-gradient":
          "radial-gradient(circle at 20% 20%, rgba(1, 87, 245, 0.35), transparent 50%), radial-gradient(circle at 80% 0%, rgba(120, 46, 255, 0.45), transparent 45%), linear-gradient(135deg, rgba(3, 7, 18, 0.9), rgba(17, 24, 39, 0.9))"
      }
    }
  },
  plugins: []
};
