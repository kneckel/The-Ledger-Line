/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Charter', 'Georgia', 'serif'],
      },
      colors: {
        // The Ledger Line palette — drawn from D:\Downloads\The_Ledger_Line_Issue_01.pdf
        brand: {
          // Page / surfaces
          paper: '#FFFFFF',         // body bg
          cream: '#FBE9D8',         // welcome card / answer-key card
          'cream-2': '#F4E5C9',     // gold-pastel column / "what you do" col
          'cream-3': '#FCEFE0',     // softer cream variant
          coral: '#F2CFC2',         // why-it-exists column / alt row
          mint: '#D9E5E3',          // what-it-says column / alt row
          // Inks
          ink: '#1B3A4B',           // hero navy + headline color
          'ink-2': '#16344A',       // deeper navy variant for cards
          'ink-soft': '#3F4A56',    // body copy
          // Accents
          orange: '#E54E2C',        // primary accent (kicker, links)
          'orange-soft': '#EE8568', // hover / secondary
          gold: '#E9B341',          // gold cards, big numbers
          'gold-bright': '#F4C460', // numbers on dark, contact email
          teal: '#1F786E',          // bylines, secondary kickers
          'teal-deep': '#1A5C56',   // teal card bg
          // Quiet
          rule: '#E2D9C6',          // hairlines on cream
        },
      },
      boxShadow: {
        newsletter: '0 6px 28px -10px rgba(27, 58, 75, 0.22)',
      },
    },
  },
  plugins: [],
};
