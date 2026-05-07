import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.describe('Skafferi (Pantry)', () => {
  // Fail immediately on any unhandled JS exception
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      throw new Error(`JS exception: ${err.message}`)
    })
  })

  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, uniqueEmail('skafferi'))
    await page.goto('/skafferi')
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 })
  })

  test('page loads with tab cards visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /I skafferiet/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Klart att laga/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Går ut snart/i })).toBeVisible()
  })

  test('tab switching works', async ({ page }) => {
    // Start on items tab — search bar should be visible
    await expect(page.getByPlaceholder('Sök i skafferiet…')).toBeVisible({ timeout: 10_000 })

    // Switch to suggestions tab
    await page.getByRole('button', { name: /Klart att laga/i }).click()
    // Search bar should be gone; suggestions content should appear
    await expect(page.getByPlaceholder('Sök i skafferiet…')).not.toBeVisible()
    await expect(page.getByText(/Kan lagas/i).first()).toBeVisible({ timeout: 5_000 })

    // Switch to expiring tab
    await page.getByRole('button', { name: /Går ut snart/i }).click()
    await expect(page.getByText(/På väg/i)).toBeVisible({ timeout: 5_000 })

    // Switch back to items tab
    await page.getByRole('button', { name: /I skafferiet/i }).click()
    await expect(page.getByPlaceholder('Sök i skafferiet…')).toBeVisible({ timeout: 5_000 })
  })

  test('can add a pantry item', async ({ page }) => {
    const itemName = `Testprodukten-${Date.now()}`

    // Open add modal
    await page.getByRole('button', { name: /Lägg till i skafferi/i }).click()

    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    // Fill in the item name
    await page.getByLabel('Namn').fill(itemName)

    // Submit
    await page.getByRole('button', { name: 'Lägg till' }).click()

    // Assert success toast
    await expect(page.getByText('Lagt till i skafferiet')).toBeVisible({ timeout: 5_000 })

    // Assert the new item appears in the pantry list
    await expect(page.getByText(itemName)).toBeVisible({ timeout: 10_000 })
  })

  test('can delete a pantry item', async ({ page }) => {
    const itemName = `Testprodukt-del-${Date.now()}`

    // Add item via UI
    await page.getByRole('button', { name: /Lägg till i skafferi/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    await page.getByLabel('Namn').fill(itemName)
    await page.getByRole('button', { name: 'Lägg till' }).click()
    await expect(page.getByText(itemName)).toBeVisible({ timeout: 10_000 })

    // Pantry is not user-scoped yet, so parallel workers may have added other items.
    // Scope delete to the card that contains our unique item name to avoid ambiguity.
    const ourCard = page.locator('div')
      .filter({ hasText: itemName })
      .filter({ has: page.locator('[aria-label="Ta bort"]') })
      .first()
    await ourCard.locator('[aria-label="Ta bort"]').click()

    // No confirmation dialog — deletion is immediate
    await expect(page.getByText('Borttagen')).toBeVisible({ timeout: 5_000 })

    // Item should be gone from the list
    await expect(page.getByText(itemName)).not.toBeVisible({ timeout: 5_000 })
  })

  test('receipt scan button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Skanna kvitto' })).toBeVisible()
  })
})
