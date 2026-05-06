import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test.describe('Collections sidebar navigation', () => {
  test('clicking Vardagsmat navigates to filtered recipe list', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Collections sidebar is desktop-only')
    await loginViaApi(page, uniqueEmail('sidebar-vardagsmat'))

    await page.getByRole('link', { name: 'Vardagsmat' }).click()

    await expect(page).toHaveURL(/category=Vardagsmat/, { timeout: 8_000 })
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
  })

  test('clicking Favoriter navigates to favorites filter', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Collections sidebar is desktop-only')
    await loginViaApi(page, uniqueEmail('sidebar-favoriter'))

    await page.getByRole('link', { name: 'Favoriter' }).click()

    await expect(page).toHaveURL(/filter=favorites/, { timeout: 8_000 })
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
  })
})
