import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          wagmi: ['@wagmi/core', 'wagmi'],
          ethers: ['ethers'],
          mobx: ['mobx'],
          antd: ['antd'],
        },
      },
    },
  },
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties'],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': process.env,
  },
})
