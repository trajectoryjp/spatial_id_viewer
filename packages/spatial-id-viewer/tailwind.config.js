/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../node_modules/flowbite-react/**/*.js',
    './src/{components,pages,views}/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
};
