import type { FileUpload, Ingredient, PantryItem, Recipe, AllergenId, WeekPlan, WeekPlanDay, ScannedRecipe, ScanStatus, ShoppingListItem } from '@/types'

export const ALLERGEN_OPTIONS: AllergenId[] = [
  'Gluten',
  'Vegetariskt',
  'Veganskt',
  'Laktos',
  'Nötter',
]

const BASE = '/api'
const TOKEN_KEY = '2eat_token'
const USER_KEY = '2eat_user'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

interface RequestOptions extends RequestInit {
  /** When true, a 401 response throws rather than redirecting to /login.
   *  Use for auth endpoints (login/register) where 401 means bad credentials. */
  noAuthRedirect?: boolean
}

async function handleResponse<T>(res: Response, noAuthRedirect = false): Promise<T> {
  if (res.status === 401) {
    if (!noAuthRedirect) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.href = '/login'
    }
    throw new Error('401 Unauthorized')
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { noAuthRedirect, ...fetchInit } = init ?? {}
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...fetchInit.headers,
    },
    ...fetchInit,
  })
  return handleResponse<T>(res, noAuthRedirect)
}

export const getRecipes = () => request<Recipe[]>('/recipes')
export const getRandomRecipes = (count: number) => request<Recipe[]>(`/recipes/random/${count}`)
export const getRecipeById = (id: number) => request<Recipe>(`/recipes/${id}`)
export const createRecipe = (data: unknown) =>
  request<Recipe>('/recipes', { method: 'POST', body: JSON.stringify(data) })
export const updateRecipe = (id: number, data: unknown) =>
  request<Recipe>(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteRecipe = (id: number) =>
  request<Recipe>(`/recipes/${id}`, { method: 'DELETE' })

export const getIngredients = () => request<Ingredient[]>('/ingredients')
export const getIngredientById = (id: number) => request<Ingredient>(`/ingredients/${id}`)
export const createIngredient = (data: Partial<Ingredient>) =>
  request<Ingredient>('/ingredients', { method: 'POST', body: JSON.stringify(data) })
export const updateIngredient = (id: number, data: { name: string; categoryId: number; pricePerUnit?: number | null }) =>
  request<Ingredient>(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteIngredient = (id: number) =>
  request<Ingredient>(`/ingredients/${id}`, { method: 'DELETE' })

export function uploadFile(file: File): Promise<FileUpload> {
  const form = new FormData()
  form.append('file', file)
  return fetch(`${BASE}/files`, {
    method: 'POST',
    body: form,
    headers: authHeaders(),
  }).then((r) => handleResponse<FileUpload>(r))
}

export const getFileUrl = (storedFileName: string) => `${BASE}/files/${storedFileName}`

export const getScanStatus = () => request<ScanStatus>('/recipes/scan/status')

export function scanRecipeFromImage(file: File): Promise<ScannedRecipe> {
  const form = new FormData()
  form.append('file', file)
  return fetch(`${BASE}/recipes/scan/image`, {
    method: 'POST',
    body: form,
    headers: authHeaders(),
  }).then((r) => handleResponse<ScannedRecipe>(r))
}

export const scanRecipeFromUrl = (url: string) =>
  request<ScannedRecipe>('/recipes/scan/url', { method: 'POST', body: JSON.stringify({ url }) })

export const getWeekPlan = (weekStartDate: string) =>
  request<WeekPlan>(`/mealplan/week/${weekStartDate}`)

export const setDaySlot = (weekStartDate: string, dayOfWeek: number, data: { recipeId: number | null; note: string }) =>
  request<WeekPlanDay>(`/mealplan/week/${weekStartDate}/day/${dayOfWeek}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const clearDaySlot = (weekStartDate: string, dayOfWeek: number) =>
  request<void>(`/mealplan/week/${weekStartDate}/day/${dayOfWeek}`, { method: 'DELETE' })

export interface ScannedItem {
  name: string
  category: string
  quantity: number
  unit: string
}

export function scanReceipt(file: File): Promise<ScannedItem[]> {
  const form = new FormData()
  form.append('file', file)
  return fetch(`${BASE}/pantry/scan-receipt`, {
    method: 'POST',
    body: form,
    headers: authHeaders(),
  }).then((r) => handleResponse<ScannedItem[]>(r))
}

export const getPantryItems = () => request<PantryItem[]>('/pantry')
export const createPantryItem = (item: Omit<PantryItem, 'id'>) =>
  request<PantryItem>('/pantry', { method: 'POST', body: JSON.stringify(item) })
export const updatePantryItem = (id: number, item: Omit<PantryItem, 'id'>) =>
  request<PantryItem>(`/pantry/${id}`, { method: 'PUT', body: JSON.stringify(item) })
export const deletePantryItem = (id: number) =>
  request<void>(`/pantry/${id}`, { method: 'DELETE' })

// Shopping list API
export const getShoppingList = () => request<ShoppingListItem[]>('/shopping-list/')
export const addShoppingListItem = (name: string, quantity?: number, unit?: string) =>
  request<ShoppingListItem>('/shopping-list/', { method: 'POST', body: JSON.stringify({ name, quantity, unit }) })
export const updateShoppingListItem = (id: number, isChecked: boolean) =>
  request<ShoppingListItem>(`/shopping-list/${id}`, { method: 'PUT', body: JSON.stringify({ isChecked }) })
export const deleteShoppingListItem = (id: number) =>
  request<void>(`/shopping-list/${id}`, { method: 'DELETE' })
export const addRecipeToShoppingList = (recipeId: number) =>
  request<void>(`/shopping-list/from-recipe/${recipeId}`, { method: 'POST' })

// Auth API
export interface AuthUser { id: number; email: string; displayName: string; avatarUrl: string | null }
export interface AuthResult { token: string; user: AuthUser }

export const authRegister = (data: { email: string; password: string; displayName: string }) =>
  request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(data), noAuthRedirect: true })

export const authLogin = (data: { email: string; password: string }) =>
  request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(data), noAuthRedirect: true })

export const getMe = () => request<AuthUser>('/auth/me')

export const updateMe = (data: { displayName: string; email: string; avatarUrl: string | null }) =>
  request<AuthUser>('/auth/me', { method: 'PUT', body: JSON.stringify(data) })

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  request<void>('/auth/me/password', { method: 'PUT', body: JSON.stringify(data) })

export const deleteAccount = () => request<void>('/auth/me', { method: 'DELETE' })
