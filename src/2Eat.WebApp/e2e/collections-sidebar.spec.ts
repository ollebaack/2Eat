import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test.describe('Collections sidebar navigation', () => {
  test('Samlingar nav item navigates to /samlingar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Sidebar nav is desktop-only')
    await loginViaApi(page, uniqueEmail('sidebar-samlingar'))

    await page.getByRole('link', { name: 'Samlingar' }).first().click()

    await expect(page).toHaveURL(/\/samlingar$/, { timeout: 8_000 })
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
  })

  test('Favoriter samling appears in sidebar and navigates to its detail page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Sidebar nav is desktop-only')
    // Registration auto-creates a "Favoriter" samling
    await loginViaApi(page, uniqueEmail('sidebar-favoriter'))

    await page.getByRole('link', { name: 'Favoriter' }).click()

    await expect(page).toHaveURL(/\/samlingar\/\d+/, { timeout: 8_000 })
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
  })
})
