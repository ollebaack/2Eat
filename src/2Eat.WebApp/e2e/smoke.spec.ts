import { test, expect } from '@playwright/test'

// Fail immediately on any unhandled JS exception
test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test('recipes page loads', async ({ page }) => {
  await page.goto('/')
  // Either recipes or empty state must appear — proves React rendered without crashing
  await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
})

test('recipe detail page loads', async ({ page }) => {
  await page.goto('/recipes/1')
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
})

test('ingredients page loads', async ({ page }) => {
  await page.goto('/ingredients')
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
})

test('new recipe form loads', async ({ page }) => {
  await page.goto('/recipes/new')
  await expect(page.locator('input, textarea, form').first()).toBeVisible({ timeout: 10_000 })
})
