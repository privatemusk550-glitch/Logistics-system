/** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
 theme: {
  extend: {
    colors: {
      aramexRed: '#E30613',
      aramexGray: '#F3F4F6',
    },
    fontFamily: {
      redHat: ['"Red Hat Display"', 'sans-serif'],
    },
    height: {
        '20':'4.5rem',
        'small': '585px',
        'banner':'300px',
        'deskt': '1285px'
      },
      width: {
        'name':'170px',
        'reply':'419px',
        'small': '780px',
        'input':'385px',
        'flex':'510px',
        'desktop':'1110px'
      },
      screens: {
        'larg':'708px',
        'larger':'908px',
      }
  },
},
  plugins: [],
}

