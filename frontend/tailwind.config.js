/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // ElevenLabs-like paleta
                gray: {
                    900: '#0f0f0f', // Hlavní pozadí
                    800: '#1a1a1a', // Panely
                    700: '#2a2a2a', // Okraje/Inputy
                    600: '#404040', // Text secondary
                }
            }
        },
    },
    plugins: [],
}