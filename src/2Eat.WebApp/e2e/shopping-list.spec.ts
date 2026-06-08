import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail, createRecipeViaApi } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test('add recipe to shopping list', async ({ page }, testInfo) => {
  // Test the desktop layout — the button also exists in mobile but we test desktop path here
  test.skip(testInfo.project.name === 'mobile', 'Testing desktop shopping-list button path')
  await loginViaApi(page, uniqueEmail('shopping'))
  const recipe = await createRecipeViaApi(page, `Shopping list test ${Date.now()}`)
  await page.goto(`/recipes/${recipe.id}`)
  // Scope to the desktop layout — both layouts render "Till handlingslista" but only desktop is
  // visible here; scoping avoids a strict-mode hit on the hidden mobile button
  const desktop = page.locator('[data-testid="recipe-detail-desktop"]')
  await expect(desktop.locator('text=Till handlingslista').first()).toBeVisible({ timeout: 10_000 })
  await desktop.locator('text=Till handlingslista').first().click()
  await expect(page.locator('text=Ingredienser tillagda i handlistan').first()).toBeVisible({ timeout: 5_000 })
})

test('copy shopping list to clipboard button is visible', async ({ page }) => {
  await loginViaApi(page, uniqueEmail('shopping-copy'))
  await page.goto('/veckoplan')
  await expect(page.locator('text=Kopiera lista').first()).toBeVisible({ timeout: 10_000 })
})
