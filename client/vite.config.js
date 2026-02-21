<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
>>>>>>> 9a40a4a1074228d482b033af20aba18bcce06150

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< HEAD
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
=======
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
>>>>>>> 9a40a4a1074228d482b033af20aba18bcce06150
