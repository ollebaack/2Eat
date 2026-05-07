import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

test.describe('Ingredient edit', () => {
  test('can edit an ingredient', async ({ page }) => {
    await loginViaApi(page, uniqueEmail('ing-edit'))
    await page.goto('/ingredients')

    // Create via API — the add dialog omits categoryId which fails the FK constraint.
    // categoryId 1 (Bakverk) is always seeded.
    const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
    const res = await page.request.post('/api/ingredients', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data: { name: 'Testvegeta', categoryId: 1 },
    })
    expect(res.ok()).toBeTruthy()

    // Reload to flush the React Query cache (API bypass doesn't trigger invalidation)
    await page.reload()
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })

    // Search by exact placeholder to surface the ingredient in the 125+ item list
    await page.getByPlaceholder('Sök ingrediens…').fill('Testvegeta')
    await expect(page.getByText('Testvegeta')).toBeVisible({ timeout: 10_000 })

    // Hover over the ingredient card to reveal the edit button
    const card = page.locator('div').filter({ hasText: /^Testvegeta/ }).first()
    await card.hover()

    // Click the edit (pencil) button
    await card.getByRole('button', { name: 'Redigera ingrediens' }).click()

    // Edit dialog should open pre-filled with current name
    const editDialog = page.getByRole('dialog')
    const nameInput = editDialog.getByPlaceholder('t.ex. Lax')
    await expect(nameInput).toHaveValue('Testvegeta', { timeout: 5_000 })

    // Change the name
    await nameInput.clear()
    await nameInput.fill('Testvegeta Edited')
    await editDialog.getByRole('button', { name: 'Spara' }).click()

    // New name should appear in the list
    await expect(page.getByText('Testvegeta Edited')).toBeVisible({ timeout: 10_000 })
    // Old name should be gone
    await expect(page.getByText('Testvegeta', { exact: true })).not.toBeVisible()
  })
})
