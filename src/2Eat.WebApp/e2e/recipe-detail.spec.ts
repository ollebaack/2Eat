import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail, createRecipeViaApi } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test.describe('Recipe Detail', () => {
  let recipeId: number

  test.beforeEach(async ({ page }, testInfo) => {
    await loginViaApi(page, uniqueEmail('detail'))
    const recipe = await createRecipeViaApi(page, `Detail test ${Date.now()}`)
    recipeId = recipe.id
    await page.goto(`/recept/${recipeId}`)
    // Scope to the layout that's actually visible at this viewport size to avoid
    // the hidden counterpart (both mobile and desktop layouts are always in the DOM)
    const layoutId = testInfo.project.name === 'mobile' ? 'recipe-detail-mobile' : 'recipe-detail-desktop'
    await expect(page.locator(`[data-testid="${layoutId}"] h1, [data-testid="${layoutId}"] h2`).first()).toBeVisible({ timeout: 10_000 })
  })

  test('servings increment increases servings count', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Servings scaler not shown on mobile tab — tested separately')

    // Scope to the desktop layout to avoid the hidden mobile scaler
    const desktop = page.locator('[data-testid="recipe-detail-desktop"]')
    const plusBtn = desktop.getByRole('button', { name: 'Öka portioner' })
    await expect(plusBtn).toBeVisible()
    const scalerSpan = plusBtn.locator('..').locator('span, div').filter({ hasText: /^\d+$/ }).first()

    const before = parseInt(await scalerSpan.textContent() ?? '0', 10)
    await plusBtn.click()
    const after = parseInt(await scalerSpan.textContent() ?? '0', 10)
    expect(after).toBeGreaterThan(before)
  })

  test('servings decrement decreases servings count', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Servings scaler not shown on mobile tab — tested separately')

    const desktop = page.locator('[data-testid="recipe-detail-desktop"]')
    const plusBtn = desktop.getByRole('button', { name: 'Öka portioner' })
    const scalerSpan = plusBtn.locator('..').locator('span, div').filter({ hasText: /^\d+$/ }).first()

    // Increment first so decrement stays above minimum
    await plusBtn.click()
    const before = parseInt(await scalerSpan.textContent() ?? '0', 10)
    await desktop.getByRole('button', { name: 'Minska portioner' }).click()
    const after = parseInt(await scalerSpan.textContent() ?? '0', 10)
    expect(after).toBeLessThan(before)
  })

  test('ingredient row can be toggled on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop ingredient list not shown on mobile')

    // aside is only in the desktop layout — scope to it anyway for clarity
    const desktop = page.locator('[data-testid="recipe-detail-desktop"]')
    const firstIngredient = desktop.locator('aside li').first()
    await expect(firstIngredient).toBeVisible()

    await firstIngredient.click()

    const nameSpan = firstIngredient.locator('span').nth(1)
    await expect(nameSpan).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('ingredient row can be toggled on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile ingredient list only on mobile')

    const mobile = page.locator('[data-testid="recipe-detail-mobile"]')

    // Multiple buttons may match /Ingredienser/ (tab + count badge); take first
    const ingredientTab = mobile.getByRole('button', { name: /Ingredienser/ }).first()
    await expect(ingredientTab).toBeVisible()

    const firstIngredient = mobile.locator('ul li').first()
    await expect(firstIngredient).toBeVisible()

    await firstIngredient.click()

    const nameSpan = firstIngredient.locator('span').nth(1)
    await expect(nameSpan).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('step completion can be toggled', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Step toggling not available on mobile tab by default')

    // ol is only rendered in the desktop layout (mobile renders ol conditionally via tab state)
    const desktop = page.locator('[data-testid="recipe-detail-desktop"]')
    const firstStep = desktop.locator('ol li').first()
    await expect(firstStep).toBeVisible()

    const stepText = firstStep.locator('p')
    await expect(stepText).not.toHaveCSS('text-decoration-line', 'line-through')

    await firstStep.click()

    await expect(stepText).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('edit button navigates to edit page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Edit button not shown on mobile')

    // Redigera recept link is only in the desktop layout
    const desktop = page.locator('[data-testid="recipe-detail-desktop"]')
    await desktop.getByRole('link', { name: /Redigera/i }).first().click()
    await expect(page).toHaveURL(new RegExp(`/recept/${recipeId}/redigera`), { timeout: 5_000 })
  })

  test('back button navigates away from recipe detail', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      // Mobile back button is inside the mobile layout (visible at mobile viewport)
      const mobile = page.locator('[data-testid="recipe-detail-mobile"]')
      await mobile.getByRole('button', { name: 'Tillbaka' }).click()
    } else {
      const desktop = page.locator('[data-testid="recipe-detail-desktop"]')
      await desktop.getByRole('button', { name: /Tillbaka till alla recept/i }).click()
    }
    await expect(page).not.toHaveURL(new RegExp(`/recept/${recipeId}$`), { timeout: 5_000 })
  })

  test('delete button opens confirmation dialog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Delete button not shown on mobile')

    // Create a second recipe owned by the test user to exercise the delete dialog
    const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
    const res = await page.request.post('/api/recipes', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data: { name: `Delete dialog test ${Date.now()}`, categoryId: 1, servings: 2 },
    })
    expect(res.ok()).toBeTruthy()
    const { id } = await res.json()

    await page.goto(`/recept/${id}`)
    // Wait for desktop layout to render
    await expect(page.locator('[data-testid="recipe-detail-desktop"] h1, [data-testid="recipe-detail-desktop"] h2').first()).toBeVisible({ timeout: 10_000 })

    await page.locator('[aria-label="Ta bort recept"]').click()

    // Dialog heading confirms the dialog is open
    await expect(page.getByRole('heading', { name: 'Ta bort recept?' })).toBeVisible({ timeout: 5_000 })

    // Cancel — do not actually delete
    await page.getByRole('button', { name: 'Avbryt' }).click()
    await expect(page).toHaveURL(`/recept/${id}`, { timeout: 3_000 })
  })
})
