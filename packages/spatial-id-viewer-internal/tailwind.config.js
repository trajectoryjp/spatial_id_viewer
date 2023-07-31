/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../node_modules/flowbite-react/**/*.js',
    '../spatial-id-viewer/src/{components,pages,views}/**/*.{ts,tsx}',
    './src/{components,pages,views}/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
};
