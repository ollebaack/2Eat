/**
 * Protected-route tests — verifies that unauthenticated users are redirected
 * to /login and that authenticated users can reach all main pages.
 */
import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

// ---------------------------------------------------------------------------
// Unauthenticated access
// ---------------------------------------------------------------------------

test.describe('Unauthenticated redirects', () => {
  const protectedRoutes = ['/', '/ingredienser', '/recept/nytt', '/veckoplan', '/skafferi', '/profil']

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login when not signed in`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL('/login', { timeout: 8_000 })
    })
  }

  test('login page is accessible without auth', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('button', { name: 'Logga in' })).toBeVisible()
  })

  test('register page is accessible without auth', async ({ page }) => {
    await page.goto('/register')
    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('button', { name: 'Skapa konto' })).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Authenticated access
// ---------------------------------------------------------------------------

test.describe('Authenticated access', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, uniqueEmail('auth'))
  })

  test('home page (utforska) renders', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('recept page renders recipe list', async ({ page }) => {
    await page.goto('/recept')
    await expect(page).toHaveURL('/recept')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('ingredients page renders', async ({ page }) => {
    await page.goto('/ingredienser')
    await expect(page).toHaveURL('/ingredienser')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('new recipe page renders form', async ({ page }) => {
    await page.goto('/recept/nytt')
    await expect(page).toHaveURL('/recept/nytt')
    await expect(page.locator('form, input').first()).toBeVisible({ timeout: 10_000 })
  })

  test('profile page renders', async ({ page }) => {
    await page.goto('/profil')
    await expect(page).toHaveURL('/profil')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('desktop sidebar shows logged-in user name', async ({ page, isMobile }) => {
    test.skip(isMobile, 'User name is shown in the desktop sidebar only')
    await page.goto('/')
    await expect(page.getByText('Min profil')).toBeVisible({ timeout: 10_000 })
  })
})
