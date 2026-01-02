import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' 

// https://vite.dev/config/
export default defineConfig({
  define : {
    'process.env' : process.env
  },
  plugins: [react(), tailwindcss()],
  resolve :{
    alias : [
      { 
        find : '~', 
        replacement  : path.resolve(__dirname, './src')
      }
    ]
  },
   test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js"
  }
})