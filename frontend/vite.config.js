import { defineConfig, loadEnv } from 'vite' // Nhớ thêm loadEnv
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env an toàn
  const env = loadEnv(mode, process.cwd(), '');

  return {

    define: {
      'process.env': env
    },

    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: '~',
          replacement: path.resolve(__dirname, './src')
        }
      ]
    },
    // Thêm cấu hình test
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
    }
  }
})