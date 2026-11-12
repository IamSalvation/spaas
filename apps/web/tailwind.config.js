/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./apps/web/src/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                spaas: {
                    navy: '#0F172A',
                    blue: '#3B82F6',
                    light: '#EFF6FF',
                    surface: '#1E293B',
                },
            },
        },
    },
    plugins: [],
}