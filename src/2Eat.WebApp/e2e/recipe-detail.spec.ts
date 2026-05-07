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

    // The scaler is the number between the − and + buttons; find it via its sibling buttons
    const plusBtn = page.getByRole('button', { name: '+' })
    await expect(plusBtn).toBeVisible()
    const scalerContainer = plusBtn.locator('..')
    const scalerSpan = scalerContainer.locator('span, div').filter({ hasText: /^\d+$/ }).first()

    const before = parseInt(await scalerSpan.textContent() ?? '0', 10)
    await plusBtn.click()
    const after = parseInt(await scalerSpan.textContent() ?? '0', 10)
    expect(after).toBeGreaterThan(before)
  })

  test('servings decrement decreases servings count', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Servings scaler not shown on mobile')

    const plusBtn = page.getByRole('button', { name: '+' })
    const minusBtn = page.getByRole('button', { name: '−' })
    const scalerContainer = plusBtn.locator('..')
    const scalerSpan = scalerContainer.locator('span, div').filter({ hasText: /^\d+$/ }).first()

    // Increment first so decrement stays above minimum
    await plusBtn.click()
    const before = parseInt(await scalerSpan.textContent() ?? '0', 10)
    await minusBtn.click()
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

    // Multiple "Ingredienser" buttons may exist (tab + count badge); take first
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
      await page.getByRole('button', { name: '←' }).click()
    } else {
      await page.getByRole('button', { name: /Tillbaka till alla recept/i }).click()
    }
    await expect(page).not.toHaveURL(/\/recipes\/1$/, { timeout: 5_000 })
  })

  test('delete button opens confirmation dialog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Delete button not shown on mobile')

    // Delete button uses title="Radera", not text content
    await page.locator('[title="Radera"]').click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Ta bort recept?')).toBeVisible()

    await page.getByRole('button', { name: 'Avbryt' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
    await expect(page).toHaveURL(/\/recipes\/1/, { timeout: 3_000 })
  })
})
