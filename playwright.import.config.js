import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'python-import.spec.js',
  reporter: 'list',
  workers: 1,
})
