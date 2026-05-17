import type { Page } from '@playwright/test'

/** Creates a minimal recipe owned by the current logged-in user and returns its id and name. */
export async function createRecipeViaApi(
  page: Page,
  name: string,
): Promise<{ id: number; name: string }> {
  const token = await page.evaluate(() => localStorage.getItem('2eat_token'))
  const res = await page.request.post('/api/recipes', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    data: {
      name,
      categoryId: 5, // Övrigt — dinner-eligible, always seeded
      description: '',
      instructions: 'Blanda ingredienserna.\nGrädda i ugn tills klart.',
      servings: 2,
      rating: 3,
      prepTime: 10,
      cookTime: 20,
      ingredients: [
        {
          order: 0,
          ingredient: { name: 'Smör', categoryId: 5 },
          ingredientMeasurement: { quantity: 100, unit: 0 },
        },
      ],
    },
  })
  const body = await res.json()
  return { id: body.id as number, name }
}

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
