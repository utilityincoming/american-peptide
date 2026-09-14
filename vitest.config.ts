import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Vitest config for AmericanPeptide.com — mirrors tsconfig's `@/*` → `./src/*`
// path alias so tests can import lib modules exactly as app code does.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
