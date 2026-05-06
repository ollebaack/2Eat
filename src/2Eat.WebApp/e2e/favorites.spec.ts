import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
  await loginViaApi(page, uniqueEmail('fav'))
})

test('bookmark button toggles favorite on recipe card', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Recipe cards with bookmark buttons are desktop-only')
  await page.goto('/')

  // Wait for recipe cards to appear (the bookmark button is inside an article)
  const bookmarkBtn = page.locator('article button[title]').first()
  await expect(bookmarkBtn).toBeVisible({ timeout: 10_000 })

  // Click the bookmark button on the first recipe card
  await bookmarkBtn.click()

  // Expect a success toast to appear
  await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5_000 })
})

test('bookmark button toggles favorite on recipe detail', async ({ page }) => {
  await page.goto('/recipes/1')

  // Wait for the page to load — the bookmark button is in the top action bar
  const bookmarkBtn = page.getByRole('button', { name: /Spara som favorit|Ta bort från favoriter/i })
  await expect(bookmarkBtn).toBeVisible({ timeout: 10_000 })

  await bookmarkBtn.click()

  // Expect a success toast to appear
  await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5_000 })
})
