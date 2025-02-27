const colors = require('tailwindcss/colors')

const primaryColor = colors.blue

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  // prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: primaryColor[600],
          light: primaryColor[500],
          lighter: primaryColor[400],
          
          subtle: primaryColor[100],
          dark: primaryColor[900],
          
          "200": primaryColor[200],
          "300": primaryColor[300],
        },
        secondary: "#6C757D",
        tertiary: "#6C757D",
        body: {
          primary: "#F8F9FA",
          secondary: "#F8F9FA",
          tertiary: "#F8F9FA",
        },
      },
      // fontFamily: {
      //   'sans': ['Nunito', 'sans-serif'],
      //   'serif': ['DM Serif Text', 'serif'],
      // },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

