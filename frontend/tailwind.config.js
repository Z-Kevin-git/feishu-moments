/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        feishu: {
          blue: '#3370FF',
          hover: '#2B5FD9',
        },
      },
    },
  },
  plugins: [],
};
