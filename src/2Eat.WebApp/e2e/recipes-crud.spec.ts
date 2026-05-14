/**
 * Recipe CRUD smoke tests — create, edit, delete.
 *
 * Each test authenticates via the API helper so it starts on the home page
 * as a logged-in user.  Recipe names include a timestamp to avoid collisions
 * when tests run in parallel across workers.
 */
import { test, expect, type Page } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

// Fail immediately on any unhandled JS exception
test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a unique recipe name for the current test run. */
const uniqueRecipeName = (prefix = 'Testrecept') =>
  `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 5)}`

/** Locates the recipe name input (plain <input>, not associated via htmlFor). */
const nameInput = (page: Page) => page.locator('input[placeholder*="Mormors"]')

/** Creates a minimal recipe via the API and returns its id. */
async function createRecipeViaApi(page: Page, name: string): Promise<number> {
  // page.request doesn't share browser localStorage — extract the JWT manually
  const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
  const res = await page.request.post('/api/recipes', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // categoryId 1 (Bakverk) is always seeded; omitting it yields a FK violation
    data: { name, categoryId: 1, description: '', instructions: '', servings: 2, rating: 3, prepTime: 10, cookTime: 20 },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  return body.id as number
}

// ---------------------------------------------------------------------------
// Create Recipe
// ---------------------------------------------------------------------------

test.describe('Create Recipe', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, uniqueEmail('crud-create'))
  })

  test('can create a new recipe', async ({ page }) => {
    const recipeName = uniqueRecipeName('Nytt Testrecept')

    await page.goto('/recipes/new')
    await nameInput(page).fill(recipeName)
    // Category is required (FK constraint). The <select> has no htmlFor so we
    // target it via its "Välj kategori…" placeholder option; "1" = Bakverk (seeded).
    await page.locator('select:has(option[value=""])').selectOption('1')
    const saveBtn = page.getByRole('button', { name: /Spara recept/ })
    await saveBtn.scrollIntoViewIfNeeded()
    await saveBtn.click()

    // Should redirect to the new recipe's detail page
    await expect(page).toHaveURL(/\/recipes\/\d+$/, { timeout: 10_000 })
    // The recipe name should be visible in the heading
    await expect(page.getByRole('heading', { name: recipeName })).toBeVisible({ timeout: 10_000 })
  })

  test('save button is disabled when recipe name is empty', async ({ page }) => {
    await page.goto('/recipes/new')

    const saveButton = page.getByRole('button', { name: /Spara recept/ })
    await expect(saveButton).toBeDisabled()

    // Typing a name enables the button
    await nameInput(page).fill('Testar aktivering')
    await expect(saveButton).toBeEnabled()
  })

  test('clearing name re-disables the save button', async ({ page }) => {
    await page.goto('/recipes/new')
    const saveButton = page.getByRole('button', { name: /Spara recept/ })

    await nameInput(page).fill('Tillfälligt namn')
    await expect(saveButton).toBeEnabled()

    await nameInput(page).clear()
    await expect(saveButton).toBeDisabled()
    // Should remain on the form page
    await expect(page).toHaveURL('/recipes/new')
  })
})

// ---------------------------------------------------------------------------
// Edit Recipe
// ---------------------------------------------------------------------------

test.describe('Edit Recipe', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, uniqueEmail('crud-edit'))
  })

  test('can edit an existing recipe', async ({ page, isMobile }) => {
    // The edit button is only on the desktop detail page — MobileDetailScreen omits it
    test.skip(isMobile, 'Edit button is in the desktop detail page only')

    const originalName = uniqueRecipeName('Originalt Recept')
    const recipeId = await createRecipeViaApi(page, originalName)

    await page.goto(`/recipes/${recipeId}`)
    await page.locator('a[title="Redigera"]').click()

    await expect(page).toHaveURL(`/recipes/${recipeId}/edit`, { timeout: 10_000 })

    const updatedName = uniqueRecipeName('Uppdaterat Recept')
    await nameInput(page).fill(updatedName)

    await page.getByRole('button', { name: /Spara ändringar/ }).click()

    await expect(page).toHaveURL(`/recipes/${recipeId}`, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible({ timeout: 10_000 })
  })

  test('cancel on edit form navigates back to detail page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Edit button is in the desktop detail page only')

    const recipeId = await createRecipeViaApi(page, uniqueRecipeName('Avbryt Recept'))

    await page.goto(`/recipes/${recipeId}/edit`)
    // exact: true avoids matching the "← Avbryt" back button on the same page
    await page.getByRole('button', { name: 'Avbryt', exact: true }).click()

    await expect(page).toHaveURL(`/recipes/${recipeId}`, { timeout: 10_000 })
  })
})

// ---------------------------------------------------------------------------
// Delete Recipe
// ---------------------------------------------------------------------------

test.describe('Delete Recipe', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, uniqueEmail('crud-delete'))
  })

  test('can delete a recipe from its detail page', async ({ page, isMobile }) => {
    // The delete dialog is only on the desktop detail page — MobileDetailScreen omits it
    test.skip(isMobile, 'Delete button is in the desktop detail page only')

    const recipeName = uniqueRecipeName('Recept att radera')
    const recipeId = await createRecipeViaApi(page, recipeName)

    await page.goto(`/recipes/${recipeId}`)
    await page.locator('[title="Ta bort recept"]').click()

    await expect(page.getByRole('heading', { name: 'Ta bort recept?' })).toBeVisible({ timeout: 8_000 })

    // Scope to the dialog to avoid matching any other "Ta bort" buttons
    await page.getByRole('dialog').getByRole('button', { name: 'Ta bort' }).click()

    await expect(page).toHaveURL('/', { timeout: 10_000 })
    await expect(page.getByText(recipeName)).toHaveCount(0, { timeout: 8_000 })
  })

  test('cancel delete dialog keeps the user on the detail page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Delete button is in the desktop detail page only')

    const recipeName = uniqueRecipeName('Avbryt Radering')
    const recipeId = await createRecipeViaApi(page, recipeName)

    await page.goto(`/recipes/${recipeId}`)
    await page.locator('[title="Ta bort recept"]').click()

    await expect(page.getByRole('heading', { name: 'Ta bort recept?' })).toBeVisible({ timeout: 8_000 })

    // Scope to the dialog so the "← Avbryt" back button behind it isn't matched
    await page.getByRole('dialog').getByRole('button', { name: 'Avbryt' }).click()

    await expect(page).toHaveURL(`/recipes/${recipeId}`, { timeout: 8_000 })
    // Dialog dismissed — Radera button back in view confirms the page is loaded and nothing was deleted
    await expect(page.locator('[title="Radera"]')).toBeVisible({ timeout: 8_000 })
  })
})
