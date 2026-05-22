/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qorliqGold: "#C6A35D",
        qorliqGoldDark: "#8A6A35",
        qorliqCream: "#F7F2E8",
        qorliqIvory: "#FFF9EF",
        qorliqDark: "#050505",
        qorliqCharcoal: "#111111",
      },

      boxShadow: {
        luxury: "0 24px 80px rgba(0, 0, 0, 0.18)",
        gold: "0 20px 60px rgba(198, 163, 93, 0.22)",
      },

      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },

      animation: {
        marquee: "marquee 15s linear infinite",
        float: "float 6s ease-in-out infinite",
        shine: "shine 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};