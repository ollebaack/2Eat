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

    // Create ingredient via API — the add dialog sends no categoryId which fails the
    // FK constraint (CategoryId is non-nullable). Use categoryId 1 (Bakverk, always seeded).
    const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
    const res = await page.request.post('/api/ingredients', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data: { name: 'Testvegeta', categoryId: 1 },
    })
    expect(res.ok()).toBeTruthy()

    // Reload so the ingredient list reflects the newly created item
    await page.reload()
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })

    // Wait for the new ingredient to appear in the list
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
