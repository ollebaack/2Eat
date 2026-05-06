import type { Page } from '@playwright/test'

/** Registers a user via the API and injects the JWT into localStorage so the UI
 *  treats the browser as already logged in. Falls back to login if the email is
 *  already taken. */
export async function loginViaApi(
  page: Page,
  email: string,
  password = 'TestPass123',
  displayName = 'Test User',
) {
  let res = await page.request.post('/api/auth/register', {
    data: { email, password, displayName },
  })
  if (!res.ok()) {
    res = await page.request.post('/api/auth/login', {
      data: { email, password },
    })
  }
  const body = await res.json()
  // Inject token into localStorage, then navigate to home so the authenticated
  // layout renders. We go to /login first (always accessible) to set storage,
  // then navigate to / so the sidebar and protected content are visible.
  await page.goto('/login')
  await page.evaluate(
    ({ token, user }: { token: string; user: unknown }) => {
      localStorage.setItem('2eat_token', token)
      localStorage.setItem('2eat_user', JSON.stringify(user))
    },
    { token: body.token, user: body.user },
  )
  await page.goto('/')
}

/** Returns a unique test email for the current test run. */
export const uniqueEmail = (prefix = 'test') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`
