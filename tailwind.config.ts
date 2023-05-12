import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
		gridTemplateRows: {
			"7": "repeat(7, minmax(0, 1fr))",
		}
	},
  },
  plugins: [],
} satisfies Config;
