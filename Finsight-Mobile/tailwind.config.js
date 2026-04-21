/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./context/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#6C63FF",
                background: "#0F0F14",
                surface: "#1A1A24",
                border: "#2A2A38",
                textPrimary: "#FFFFFF",
                textSecondary: "#8888AA",
                success: "#22C55E",
                danger: "#EF4444",
                warning: "#F59E0B",
            },
        },
    },
    plugins: [],
};