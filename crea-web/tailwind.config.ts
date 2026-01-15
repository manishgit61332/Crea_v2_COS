import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    black: '#000000',
                    orange: '#FF7701',
                    mint: '#E3FFEB',
                    red: '#580C11',
                    pink: '#FF9F9F'
                }
            },
            fontFamily: {
                serif: ['var(--font-instrument-serif)', 'serif'],
                sans: ['var(--font-satoshi)', 'sans-serif'],
            }
        },
    },
    plugins: [],
} satisfies Config;
