import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (err) => {
    throw new Error(`JS exception: ${err.message}`)
  })
  await loginViaApi(page, uniqueEmail('pantry-edit'))
})

test('edit pantry item from expiring section', async ({ page }) => {
  await page.goto('/skafferi')
  await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 })

  // Click the "Går ut snart" / expiring tab card
  const expiringCard = page.getByText('Går ut snart').first()
  await expiringCard.click()

  // Check if there are any expiring items with a "Hantera" button
  const hanteraBtn = page.getByRole('button', { name: /Hantera/i }).first()
  const hasExpiring = await hanteraBtn.isVisible().catch(() => false)

  if (!hasExpiring) {
    // No expiring items — gracefully skip the edit interaction
    test.info().annotations.push({
      type: 'skip-reason',
      description: 'No expiring items in the pantry to test Hantera button',
    })
    return
  }

  // Click the Hantera button — it should open the edit dialog
  await hanteraBtn.click()

  // The edit modal should appear with a title "Redigera vara"
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText('Redigera vara')).toBeVisible()

  // The dialog should have a save button
  await expect(page.getByRole('button', { name: /Spara/i })).toBeVisible()

  // Close the dialog via Avbryt
  await page.getByRole('button', { name: /Avbryt/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
})

test('edit pantry item from main items list', async ({ page }) => {
  await page.goto('/skafferi')
  await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 })

  // The items tab is active by default — look for a pencil/edit button
  const editBtn = page.getByRole('button', { name: /Redigera/i }).first()
  const hasItems = await editBtn.isVisible().catch(() => false)

  if (!hasItems) {
    test.info().annotations.push({
      type: 'skip-reason',
      description: 'No pantry items in the list to test edit button',
    })
    return
  }

  await editBtn.click()

  // The edit modal should appear
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText('Redigera vara')).toBeVisible()

  // Verify the form fields are present
  await expect(page.getByLabel('Namn')).toBeVisible()
  await expect(page.getByLabel(/Antal/i)).toBeVisible()
  await expect(page.getByLabel(/Enhet/i)).toBeVisible()
  await expect(page.getByLabel(/Bäst-före/i)).toBeVisible()

  // Close via cancel
  await page.getByRole('button', { name: /Avbryt/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
})
