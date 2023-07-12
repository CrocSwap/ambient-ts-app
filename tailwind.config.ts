/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'blur-bg': 'rgba(14, 19, 26, 0.5)',
                text1: '#f0f0f8',
                text2: '#8b98a5',
                text3: '#61646f',
                dark1: '#0d1117',
                dark2: '#171d27',
                dark3: '#242f3f',
                dark4: '#141922',
                accent1: '#7371fc',
                accent2: '#e480ff',
                accent3: '#5ffff2',
                accent4: '#71b5fc',
                accent5: '#cdc1ff',
                positive: '#15be6f',
                negative: '#f6385b',
                'other-green': '#41d18e',
                'other-red': '#e75670',
            },
            fontSize: {
                header1: '24px',
                header2: '18px',
                header: '16px',
                body: '12px',
            },
            lineHeight: {
                header1: '25px',
                header2: '22px',
                body: '15px',
            },
            fontWeight: {
                regular: '300',
            },
        },
    },
    plugins: [],
};
