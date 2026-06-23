import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig({
  plugins: [
    tailwindcss({
      config: {
        content: [
          "./index.html",
          "./src/**/*.{js,jsx,ts,tsx}",
        ]
      }
    }),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src')
    }
  }
})