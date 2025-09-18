import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    hookTimeout: 5000, 
    testTimeout: 5000,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/index.ts', 'src/tests/**/*'],
    },
    globals: true,
    setupFiles: ['./src/tests/empresas/setup.ts'],
    dir: './src/tests',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), 
    },
  },
  plugins: [tsconfigPaths()],
})
