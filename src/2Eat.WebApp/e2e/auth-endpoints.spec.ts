/**
 * API authorization tests — verifies that unauthenticated requests to
 * MealPlan and Pantry endpoints are rejected with 401.
 */
import { test, expect } from '@playwright/test'

test('unauthenticated access to mealplan is rejected', async ({ page }) => {
  await page.goto('/login')
  const status = await page.evaluate(() =>
    fetch('/api/mealplan/week/2024-01-01').then(r => r.status),
  )
  expect(status).toBe(401)
})

test('unauthenticated access to pantry is rejected', async ({ page }) => {
  await page.goto('/login')
  const status = await page.evaluate(() =>
    fetch('/api/pantry').then(r => r.status),
  )
  expect(status).toBe(401)
})
