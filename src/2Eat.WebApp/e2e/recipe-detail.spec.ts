import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test.describe('Recipe Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, uniqueEmail('detail'))
    await page.goto('/recipes/1')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('servings increment increases servings count', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Servings scaler not shown on mobile')

    // Scope to the scaler container (parent of +/− buttons) to avoid matching step numbers
    const plusBtn = page.getByRole('button', { name: '+' })
    await expect(plusBtn).toBeVisible()
    const scalerSpan = plusBtn.locator('..').locator('span, div').filter({ hasText: /^\d+$/ }).first()

    const before = parseInt(await scalerSpan.textContent() ?? '0', 10)
    await plusBtn.click()
    const after = parseInt(await scalerSpan.textContent() ?? '0', 10)
    expect(after).toBeGreaterThan(before)
  })

  test('servings decrement decreases servings count', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Servings scaler not shown on mobile')

    const plusBtn = page.getByRole('button', { name: '+' })
    const scalerSpan = plusBtn.locator('..').locator('span, div').filter({ hasText: /^\d+$/ }).first()

    // Increment first so decrement stays above minimum
    await plusBtn.click()
    const before = parseInt(await scalerSpan.textContent() ?? '0', 10)
    await page.getByRole('button', { name: '−' }).click()
    const after = parseInt(await scalerSpan.textContent() ?? '0', 10)
    expect(after).toBeLessThan(before)
  })

  test('ingredient row can be toggled on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop ingredient list not shown on mobile')

    const firstIngredient = page.locator('aside li').first()
    await expect(firstIngredient).toBeVisible()

    await firstIngredient.click()

    const nameSpan = firstIngredient.locator('span').nth(1)
    await expect(nameSpan).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('ingredient row can be toggled on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile ingredient list only on mobile')

    // Multiple buttons may match /Ingredienser/ (tab + count badge); take first
    const ingredientTab = page.getByRole('button', { name: /Ingredienser/ }).first()
    await expect(ingredientTab).toBeVisible()

    const firstIngredient = page.locator('ul li').first()
    await expect(firstIngredient).toBeVisible()

    await firstIngredient.click()

    const nameSpan = firstIngredient.locator('span').nth(1)
    await expect(nameSpan).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('step completion can be toggled', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Step toggling not available on mobile')

    const firstStep = page.locator('ol li').first()
    await expect(firstStep).toBeVisible()

    const stepText = firstStep.locator('p')
    await expect(stepText).not.toHaveCSS('text-decoration-line', 'line-through')

    await firstStep.click()

    await expect(stepText).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('edit button navigates to edit page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Edit button not shown on mobile')

    await page.getByRole('link', { name: /Redigera/i }).first().click()
    await expect(page).toHaveURL(/\/recipes\/1\/edit/, { timeout: 5_000 })
  })

  test('back button navigates away from recipe detail', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: 'Tillbaka' }).click()
    } else {
      await page.getByRole('button', { name: /Tillbaka till alla recept/i }).click()
    }
    await expect(page).not.toHaveURL(/\/recipes\/1$/, { timeout: 5_000 })
  })

  test('delete button opens confirmation dialog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Delete button not shown on mobile')

    // Recipe 1 is owned by the seed user, not the test user — delete button may be hidden.
    // Create a recipe owned by the test user instead.
    const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
    const res = await page.request.post('/api/recipes', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data: { name: `Delete dialog test ${Date.now()}`, categoryId: 1, servings: 2 },
    })
    expect(res.ok()).toBeTruthy()
    const { id } = await res.json()

    await page.goto(`/recipes/${id}`)
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })

    await page.locator('[title="Ta bort recept"]').click()

    // Dialog heading confirms the dialog is open
    await expect(page.getByRole('heading', { name: 'Ta bort recept?' })).toBeVisible({ timeout: 5_000 })

    // Cancel — do not actually delete
    await page.getByRole('button', { name: 'Avbryt' }).click()
    await expect(page).toHaveURL(`/recipes/${id}`, { timeout: 3_000 })
  })
})
