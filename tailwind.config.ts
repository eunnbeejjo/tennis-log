import type { Config } from "tailwindcss";

const gray = {
  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E4E4E7",
  300: "#D4D4D8",
  400: "#A1A1AA",
  500: "#71717A",
  600: "#52525B",
  700: "#3F3F46",
  800: "#27272A",
  900: "#18181B",
};

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: gray,
        gray,
        court: {
          DEFAULT: "#12805B",
          light: "#E7F5EF",
          dark: "#0B5C41",
        },
        cycle: {
          DEFAULT: "#D6416F",
          light: "#FBE7EE",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      maxWidth: {
        app: "480px", // 모바일 전용 최대 너비
      },
      borderColor: {
        DEFAULT: "#E4E4E7",
      },
      boxShadow: {
        card: "0 1px 2px rgba(24, 24, 27, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
