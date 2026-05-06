import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

/** Returns the index (within page.locator('button')) of the sibling nav button
 *  that is `offset` positions away from "Den här veckan" inside the nav group. */
async function navBtnIndex(page: Parameters<typeof loginViaApi>[0], offset: -1 | 1) {
  return page.locator('button', { hasText: 'Den här veckan' }).evaluate((el, off) => {
    const buttons = Array.from(el.closest('div')!.querySelectorAll('button'))
    return buttons.indexOf(el) + off
  }, offset)
}

test.describe('Veckoplan (Weekly Meal Plan)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => {
      throw new Error(`JS exception: ${err.message}`)
    })
    await loginViaApi(page, uniqueEmail('veckoplan'))
    await page.goto('/veckoplan')
    await expect(page.locator('h1').filter({ hasText: 'Veckoplan' })).toBeVisible({ timeout: 10_000 })
  })

  test('page loads with current week visible', async ({ page }) => {
    await expect(page.locator('span').filter({ hasText: /Vecka \d+/ })).toBeVisible()

    for (const label of ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']) {
      await expect(page.getByText(label).first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('next week navigation changes the week', async ({ page }) => {
    const weekLabel = page.locator('span').filter({ hasText: /Vecka \d+/ })
    const originalText = await weekLabel.textContent()

    await page.locator('button').nth(await navBtnIndex(page, 1)).click()

    await expect(weekLabel).not.toHaveText(originalText ?? '', { timeout: 5_000 })
  })

  test('previous week navigation changes the week', async ({ page }) => {
    const weekLabel = page.locator('span').filter({ hasText: /Vecka \d+/ })
    const originalText = await weekLabel.textContent()

    await page.locator('button').nth(await navBtnIndex(page, -1)).click()

    await expect(weekLabel).not.toHaveText(originalText ?? '', { timeout: 5_000 })
  })

  test('"Den här veckan" button resets to current week', async ({ page }) => {
    const weekLabel = page.locator('span').filter({ hasText: /Vecka \d+/ })
    const originalText = await weekLabel.textContent()

    await page.locator('button').nth(await navBtnIndex(page, 1)).click()
    await expect(weekLabel).not.toHaveText(originalText ?? '', { timeout: 5_000 })

    await page.getByRole('button', { name: 'Den här veckan' }).click()
    await expect(weekLabel).toHaveText(originalText ?? '', { timeout: 5_000 })
  })

  test('clicking empty day slot opens recipe picker', async ({ page }) => {
    const addButton = page.getByText('Lägg till').first()
    await expect(addButton).toBeVisible({ timeout: 10_000 })
    await addButton.click()

    const pickerHeading = page.locator('h2').filter({ hasText: 'Vad ska vi äta?' })
    await expect(pickerHeading).toBeVisible({ timeout: 5_000 })
    await expect(page.getByPlaceholder('Sök recept…')).toBeVisible()

    await page.getByRole('button', { name: 'Avbryt' }).click()
    await expect(pickerHeading).not.toBeVisible({ timeout: 3_000 })
  })

  test('closing recipe picker via backdrop dismisses modal', async ({ page }) => {
    const addButton = page.getByText('Lägg till').first()
    await expect(addButton).toBeVisible({ timeout: 10_000 })
    await addButton.click()

    const pickerHeading = page.locator('h2').filter({ hasText: 'Vad ska vi äta?' })
    await expect(pickerHeading).toBeVisible({ timeout: 5_000 })

    // The modal backdrop covers the viewport; clicking the top-left corner (outside
    // the inner panel) triggers the backdrop's onClick handler to close it.
    await page.mouse.click(10, 10)
    await expect(pickerHeading).not.toBeVisible({ timeout: 3_000 })
  })

  test('can add a recipe to a day slot', async ({ page }) => {
    const addButton = page.getByText('Lägg till').first()
    await expect(addButton).toBeVisible({ timeout: 10_000 })
    await addButton.click()

    const pickerHeading = page.locator('h2').filter({ hasText: 'Vad ska vi äta?' })
    await expect(pickerHeading).toBeVisible({ timeout: 5_000 })

    // The recipe rows inside the modal are buttons containing a serif-font name div
    const firstRecipeBtn = page.locator('button').filter({ has: page.locator('[style*="font-serif"]') }).first()

    if (!(await firstRecipeBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      await page.getByRole('button', { name: 'Avbryt' }).click()
      test.skip(true, 'No recipes available to pick')
      return
    }

    const recipeName = await firstRecipeBtn.locator('[style*="font-serif"]').first().textContent()
    await firstRecipeBtn.click()

    await expect(pickerHeading).not.toBeVisible({ timeout: 5_000 })

    if (recipeName) {
      await expect(page.getByText(recipeName.trim()).first()).toBeVisible({ timeout: 10_000 })
    }
  })
})
