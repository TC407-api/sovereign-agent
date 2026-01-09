import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    include: ['convex/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  ssr: {
    noExternal: ['convex-test'],
  },
})
