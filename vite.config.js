import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  optimizeDeps: {
    include: ['maplibre-gl']
  }
>>>>>>> Sabeshhan
})
