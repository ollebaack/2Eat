import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail, createRecipeViaApi } from './helpers'

// Fail immediately on any unhandled JS exception
test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

// Authenticate once per worker so all page-load tests run as a logged-in user
test.beforeEach(async ({ page }) => {
  await loginViaApi(page, uniqueEmail('smoke'))
})

test('home page (utforska) loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
})

test('recipes page loads', async ({ page }) => {
  await page.goto('/recept')
  await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
})

test('recipe detail page loads', async ({ page }) => {
  const recipe = await createRecipeViaApi(page, `Smoke detail test ${Date.now()}`)
  await page.goto(`/recipes/${recipe.id}`)
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
