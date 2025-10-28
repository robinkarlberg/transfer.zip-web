import colors from 'tailwindcss/colors'

const primaryColor = colors.blue
const compColor = colors.amber

/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{html,js}"]
export const theme = {
  extend: {
    colors: {
      primary: {
        DEFAULT: primaryColor[600],
        light: primaryColor[500],
        lighter: primaryColor[400],

        subtle: primaryColor[100],
        dark: primaryColor[900],

        "50": primaryColor[50],
        "100": primaryColor[100],
        "200": primaryColor[200],
        "300": primaryColor[300],
        "400": primaryColor[400],
        "500": primaryColor[500],
        "600": primaryColor[600],
        "700": primaryColor[700],
        "800": primaryColor[800],
        "900": primaryColor[900],
      },
      comp: {
        DEFAULT: compColor[500],
        "50": compColor[50],
        "100": compColor[100],
        "200": compColor[200],
        "300": compColor[300],
        "400": compColor[400],
        "500": compColor[500],
        "600": compColor[600],
        "700": compColor[700],
        "800": compColor[800],
        "900": compColor[900],
      }
    },
    // fontFamily: {
    //   'sans': ['Montserrat', 'sans-serif'],
    //   'serif': ['Playfair Display', 'serif'],
    // },
  },
}

export const plugins = [
  require('@tailwindcss/forms'),
]

