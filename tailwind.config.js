/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Agregar estas clases para el scrollbar personalizado
      scrollbar: {
        thin: {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(107, 114, 128, 0.5)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(107, 114, 128, 0.7)',
          },
        },
      },
    },
  },
  plugins: [
    // Plugin para scrollbar personalizado
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(107, 114, 128, 0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(107, 114, 128, 0.5)',
          },
        },
        '.scrollbar-track-gray-700\\/20': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(55, 65, 81, 0.2)',
          },
        },
        '.scrollbar-thumb-gray-600\\/50': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(75, 85, 99, 0.5)',
          },
        },
        '.scrollbar-thumb-gray-500\\/70:hover': {
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(107, 114, 128, 0.7)',
          },
        },
      });
    },
  ],
};