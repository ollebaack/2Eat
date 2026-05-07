import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test('add recipe to shopping list', async ({ page }) => {
  await loginViaApi(page, uniqueEmail('shopping'))
  await page.goto('/recipes/1')
  await expect(page.locator('text=Till handlista').first()).toBeVisible({ timeout: 10_000 })
  await page.locator('text=Till handlista').first().click()
  await expect(page.locator('text=Ingredienser tillagda i handlistan').first()).toBeVisible({ timeout: 5_000 })
})

test('copy shopping list to clipboard button is visible', async ({ page }) => {
  await loginViaApi(page, uniqueEmail('shopping-copy'))
  await page.goto('/veckoplan')
  await expect(page.locator('text=Kopiera lista').first()).toBeVisible({ timeout: 10_000 })
})
