import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // 👈 BẮT BUỘC PHẢI CÓ DÒNG NÀY

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve :{
    alias : [
      { 
        find : '~', 
        replacement  : path.resolve(__dirname, './src') // 👈 SỬA LẠI ĐƯỜNG DẪN
      }
    ]
  }
})