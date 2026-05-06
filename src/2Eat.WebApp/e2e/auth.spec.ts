/**
 * Auth flow tests — registration, login, logout.
 *
 * Every test that submits the register form uses a unique email so tests
 * can run in parallel without conflicting with each other.
 */
import { test, expect } from '@playwright/test'
import { loginViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', err => {
    throw new Error(`JS exception: ${err.message}`)
  })
})

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

test.describe('Registration', () => {
  test('happy path — creates account and redirects to home', async ({ page, isMobile }) => {
    const email = uniqueEmail('reg')
    await page.goto('/register')
    await page.getByLabel('Ditt namn').fill('Happy User')
    await page.getByLabel('E-post').fill(email)
    await page.getByLabel('Lösenord', { exact: true }).fill('TestPass123')
    await page.getByLabel('Bekräfta lösenord').fill('TestPass123')
    await page.getByRole('button', { name: 'Skapa konto' }).click()

    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 10_000 })
    // On desktop the sidebar shows the display name; mobile uses a bottom tab bar without it
    if (!isMobile) {
      await expect(page.getByText('Happy User')).toBeVisible({ timeout: 10_000 })
    }
  })

  test('duplicate email shows error toast', async ({ page }) => {
    const email = uniqueEmail('dup')
    // Pre-create the account via API
    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPass123', displayName: 'Existing User' },
    })

    await page.goto('/register')
    await page.getByLabel('Ditt namn').fill('Duplicate User')
    await page.getByLabel('E-post').fill(email)
    await page.getByLabel('Lösenord', { exact: true }).fill('TestPass123')
    await page.getByLabel('Bekräfta lösenord').fill('TestPass123')
    await page.getByRole('button', { name: 'Skapa konto' }).click()

    await expect(page.getByText('redan registrerad')).toBeVisible({ timeout: 8_000 })
    // Should stay on register page
    await expect(page).toHaveURL('/register')
  })

  test('mismatched passwords shows toast and stays on page', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Ditt namn').fill('Mismatch User')
    await page.getByLabel('E-post').fill(uniqueEmail('mis'))
    await page.getByLabel('Lösenord', { exact: true }).fill('TestPass123')
    await page.getByLabel('Bekräfta lösenord').fill('DifferentPass!')
    await page.getByRole('button', { name: 'Skapa konto' }).click()

    await expect(page.getByText('matchar inte')).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL('/register')
  })

  test('password shorter than 8 chars is blocked by HTML constraint', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Ditt namn').fill('Short PW User')
    await page.getByLabel('E-post').fill(uniqueEmail('short'))
    const passwordInput = page.getByLabel('Lösenord', { exact: true })
    await passwordInput.fill('abc')
    await page.getByLabel('Bekräfta lösenord').fill('abc')
    await page.getByRole('button', { name: 'Skapa konto' }).click()

    // HTML minLength=8 prevents form submission — page stays on /register
    await expect(page).toHaveURL('/register')
    // The password input must report itself as constraint-invalid
    const valid = await passwordInput.evaluate((el: HTMLInputElement) => el.validity.tooShort)
    expect(valid).toBe(true)
  })

  test('"Logga in" link navigates to login page', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('link', { name: 'Logga in' }).click()
    await expect(page).toHaveURL('/login', { timeout: 8_000 })
  })
})

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

test.describe('Login', () => {
  test('happy path — logs in and redirects to home', async ({ page, isMobile }) => {
    const email = uniqueEmail('login')
    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPass123', displayName: 'Login User' },
    })

    await page.goto('/login')
    await page.getByLabel('E-post').fill(email)
    await page.getByLabel('Lösenord').fill('TestPass123')
    await page.getByRole('button', { name: 'Logga in' }).click()

    await expect(page).toHaveURL('/', { timeout: 10_000 })
    // On desktop the sidebar shows the display name; mobile uses a bottom tab bar without it
    if (!isMobile) {
      await expect(page.getByText('Login User')).toBeVisible({ timeout: 10_000 })
    }
  })

  test('wrong password shows error toast and stays on login', async ({ page }) => {
    const email = uniqueEmail('wrongpw')
    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPass123', displayName: 'WrongPW User' },
    })

    await page.goto('/login')
    await page.getByLabel('E-post').fill(email)
    await page.getByLabel('Lösenord').fill('NotTheRightPassword!')
    await page.getByRole('button', { name: 'Logga in' }).click()

    await expect(page.getByText('Fel e-post eller lösenord')).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL('/login')
  })

  test('unknown email shows error toast and stays on login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-post').fill('nobody-at-all@nowhere.invalid')
    await page.getByLabel('Lösenord').fill('TestPass123')
    await page.getByRole('button', { name: 'Logga in' }).click()

    await expect(page.getByText('Fel e-post eller lösenord')).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL('/login')
  })

  test('"Registrera dig" link navigates to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Registrera dig' }).click()
    await expect(page).toHaveURL('/register', { timeout: 8_000 })
  })
})

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

// The logout button lives in the desktop sidebar only — mobile uses a bottom
// tab bar with no logout entry. These tests are skipped on mobile.
test.describe('Logout', () => {
  test('logout clears session and redirects to login', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Logout button is in the desktop sidebar only')
    await loginViaApi(page, uniqueEmail('logout'))

    await page.locator('button[title="Logga ut"]').click()

    await expect(page).toHaveURL('/login', { timeout: 10_000 })
    // localStorage should be cleared
    const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
    expect(token).toBeNull()
  })

  test('after logout, navigating to home redirects to login', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Logout button is in the desktop sidebar only')
    await loginViaApi(page, uniqueEmail('logout2'))
    await page.locator('button[title="Logga ut"]').click()
    await expect(page).toHaveURL('/login', { timeout: 10_000 })

    await page.goto('/')
    await expect(page).toHaveURL('/login', { timeout: 8_000 })
  })
})
