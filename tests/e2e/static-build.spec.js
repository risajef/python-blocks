import { test, expect } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const output = fileURLToPath(new URL('../../dist/', import.meta.url))

test('production build runs at a nested static-host subpath', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/preview/editor/**', async route => {
    const url = new URL(route.request().url())
    const relative = url.pathname.slice('/preview/editor/'.length) || 'index.html'
    const file = path.resolve(output, relative)
    if (!file.startsWith(output)) return route.abort()
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png' }
    await route.fulfill({ body: await fs.readFile(file), contentType: types[path.extname(file)] })
  })
  await page.goto('/preview/editor/')
  await expect(page.locator('.python-blocks-board')).toBeVisible()
  await page.getByTestId('python-blocks-advanced-toggle').click()
  await page.locator('textarea:visible').fill('print(42)')
  await page.getByRole('button', { name: 'Import Python', exact: true }).click()
  await expect(page.locator('.code-content')).toContainText('print(42)')
  expect(errors).toEqual([])
})
