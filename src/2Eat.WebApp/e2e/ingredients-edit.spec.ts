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
    await page.goto('/ingredienser')

    // Create via API — the add dialog omits categoryId which fails the FK constraint.
    // categoryId 1 (Bakverk) is always seeded.
    const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
    // Use a timestamp-unique name to avoid collisions with parallel tests sharing the ingredients table
    const ingName = `Testvegeta-${Date.now()}`
    const ingNameEdited = `${ingName}-v2`

    const res = await page.request.post('/api/ingredients', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data: { name: ingName, categoryId: 1 },
    })
    expect(res.ok()).toBeTruthy()

    // Reload to flush the React Query cache (API bypass doesn't trigger invalidation)
    await page.reload()
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })

    // Search by exact placeholder to surface the ingredient in the 125+ item list
    await page.getByPlaceholder('Sök ingrediens…').fill(ingName)
    await expect(page.getByText(ingName).first()).toBeVisible({ timeout: 10_000 })

    // The edit button is conditionally rendered via React onMouseEnter state.
    // mouseenter doesn't bubble, so dispatchEvent on a child doesn't reach the card.
    // Instead, use page.mouse.move() to fire native events through the full DOM chain.
    const nameEl = page.getByText(ingName, { exact: true }).first()
    await nameEl.scrollIntoViewIfNeeded()
    const box = await nameEl.boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)

    // Wait for the button to appear in the DOM, then click
    await expect(page.locator('[aria-label="Redigera ingrediens"]')).toBeVisible({ timeout: 3_000 })
    await page.locator('[aria-label="Redigera ingrediens"]').click()

    // Edit dialog should open pre-filled with current name
    const editDialog = page.getByRole('dialog')
    const nameInput = editDialog.getByPlaceholder('t.ex. Lax')
    await expect(nameInput).toHaveValue(ingName, { timeout: 5_000 })

    // Change the name
    await nameInput.clear()
    await nameInput.fill(ingNameEdited)
    await editDialog.getByRole('button', { name: 'Spara' }).click()

    // New name should appear in the list
    await expect(page.getByText(ingNameEdited)).toBeVisible({ timeout: 10_000 })
    // Old name should be gone (exact match excludes the edited name)
    await expect(page.getByText(ingName, { exact: true })).not.toBeVisible({ timeout: 3_000 })
  })
})
