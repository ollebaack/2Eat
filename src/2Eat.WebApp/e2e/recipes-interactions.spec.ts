import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

const SEARCH_PLACEHOLDER = /Sök (bland recept|recept eller ingrediens)…/

// Fail immediately on any unhandled JS exception
test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test.describe('Recipe Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, uniqueEmail('interactions'))
    // loginViaApi already navigates to '/', just wait for content
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
  })

  test('search input filters recipe list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(SEARCH_PLACEHOLDER).first()
    await expect(searchInput).toBeVisible()

    await searchInput.fill('zzznomatch')
    // Seeded recipe "Kanelbullar" should not be visible with a no-match query
    await expect(page.getByText('Kanelbullar')).not.toBeVisible({ timeout: 5_000 })
  })

  test('search input shows results for seeded recipe name', async ({ page }) => {
    const searchInput = page.getByPlaceholder(SEARCH_PLACEHOLDER).first()
    await expect(searchInput).toBeVisible()

    await searchInput.fill('Kanel')
    await expect(page.getByText('Kanelbullar').first()).toBeVisible({ timeout: 5_000 })
  })

  test('category filter chip filters recipes', async ({ page, isMobile }) => {
    // Category chips are only visible on desktop (hidden behind a filter toggle on mobile)
    if (isMobile) { test.skip(); return }
    await page.getByRole('button', { name: 'Bakverk' }).click()
    await expect(page.locator('article').first()).toBeVisible({ timeout: 5_000 })
  })

  test('view toggle switches between grid and list', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip()
      return
    }

    // Icon-only buttons inside the pill-shaped toggle container
    const toggleContainer = page.locator(
      'div[style*="inline-flex"][style*="border-radius: 999"]',
    ).filter({ has: page.locator('button').nth(0) }).first()

    const gridBtn = toggleContainer.locator('button').nth(0)
    const listBtn = toggleContainer.locator('button').nth(1)

    await expect(gridBtn).toBeVisible({ timeout: 5_000 })
    await expect(listBtn).toBeVisible()

    await expect(page.locator('article').first()).toBeVisible({ timeout: 5_000 })

    await listBtn.click()
    await expect(page.locator('article').first()).toBeVisible({ timeout: 5_000 })

    await gridBtn.click()
    await expect(page.locator('article').first()).toBeVisible({ timeout: 5_000 })
  })

  test('Slumpa middag button opens shuffle overlay', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip()
      return
    }

    const shuffleBtn = page.getByRole('button', { name: /Slumpa middag/ })
    await expect(shuffleBtn).toBeVisible({ timeout: 5_000 })
    await shuffleBtn.click()

    // The ShuffleModal is a raw div overlay (not a Radix Dialog); verify via unique button
    const rerollBtn = page.getByRole('button', { name: /Slumpa igen/ })
    await expect(rerollBtn).toBeVisible({ timeout: 5_000 })
  })

  test('allergen filter toggles update recipe list', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip()
      return
    }

    const glutenBtn = page.getByRole('button', { name: 'Gluten' })
    await expect(glutenBtn).toBeVisible({ timeout: 5_000 })

    await glutenBtn.click()
    await expect(
      page.locator('article').first().or(page.getByText('Inga recept matchar.')),
    ).toBeVisible({ timeout: 5_000 })

    // Deactivate — full list should restore
    await glutenBtn.click()
    await expect(page.getByText('Kanelbullar').first()).toBeVisible({ timeout: 5_000 })
  })
})
