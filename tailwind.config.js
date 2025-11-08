/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{js,jsx}'
],
theme: {
extend: {
  colors: {
    eco: '#7EC97D',
    empathy: '#7AB5FF',
    responsible: '#F49D9B',
    finance: '#F2C94C'
  }
}
},
plugins: []
}