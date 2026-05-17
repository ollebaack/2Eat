import type { Category, FileUpload, Ingredient, PantryItem, Recipe, RecipePage, AllergenId, WeekPlan, WeekPlanDay, ScannedRecipe, ScanStatus, ShoppingListItem, SamlingListItem, SamlingDetail, Forslag } from '@/types'

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
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
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

export const getCategories = () => request<Category[]>('/categories')
export const getRecipes = () => request<Recipe[]>('/recipes')

export interface RecipePageQuery {
  seed: number
  page: number
  pageSize?: number
  search?: string
  categoryId?: number
  allergens?: AllergenId[]
  ingredientIds?: number[]
}

export const getRecipesPage = (q: RecipePageQuery): Promise<RecipePage> => {
  const params = new URLSearchParams()
  params.set('seed', String(q.seed))
  params.set('page', String(q.page))
  if (q.pageSize) params.set('pageSize', String(q.pageSize))
  if (q.search) params.set('search', q.search)
  if (q.categoryId) params.set('categoryId', String(q.categoryId))
  if (q.allergens?.length) params.set('allergens', q.allergens.join(','))
  if (q.ingredientIds?.length) params.set('ingredientIds', q.ingredientIds.join(','))
  return request<RecipePage>(`/recipes/feed?${params}`)
}
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

export async function fetchFile(storedFileName: string): Promise<Blob> {
  const res = await fetch(`${BASE}/files/${storedFileName}`, { headers: authHeaders() })
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    window.location.href = '/login'
    throw new Error('401 Unauthorized')
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.blob()
}

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
export const seedStarterItems = () =>
  request<PantryItem[]>('/pantry/starter', { method: 'POST' })
export const parseTextToPantryItems = (text: string) =>
  request<ScannedItem[]>('/pantry/parse-text', { method: 'POST', body: JSON.stringify({ text }) })

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

// Samlingar API
export const getSamlingar = () => request<SamlingListItem[]>('/samlingar')
export const createSamling = (name: string) =>
  request<SamlingListItem>('/samlingar', { method: 'POST', body: JSON.stringify({ name }) })
export const getSamlingById = (id: number) => request<SamlingDetail>(`/samlingar/${id}`)
export const renameSamling = (id: number, name: string) =>
  request<SamlingListItem>(`/samlingar/${id}`, { method: 'PUT', body: JSON.stringify({ name }) })
export const deleteSamling = (id: number) => request<void>(`/samlingar/${id}`, { method: 'DELETE' })
export const addReceptToSamling = (samlingId: number, receptId: number) =>
  request<void>(`/samlingar/${samlingId}/recept`, { method: 'POST', body: JSON.stringify({ receptId }) })
export const removeReceptFromSamling = (samlingId: number, receptId: number) =>
  request<void>(`/samlingar/${samlingId}/recept/${receptId}`, { method: 'DELETE' })
export const updateSamlingOrder = (samlingId: number, receptIds: number[]) =>
  request<void>(`/samlingar/${samlingId}/recept/order`, { method: 'PUT', body: JSON.stringify({ receptIds }) })
export const getSamlingarForRecept = (receptId: number) =>
  request<{ samlingIds: number[] }>(`/recipes/${receptId}/samlingar`)
export const syncReceptSamlingar = (receptId: number, samlingIds: number[]) =>
  request<void>(`/recipes/${receptId}/samlingar`, { method: 'PUT', body: JSON.stringify({ samlingIds }) })

// Utforska (Explore) API
export const getUtforskaForslag = () => request<Forslag[]>('/utforska')
export const getAllUnseenForslag = () => request<Forslag[]>('/utforska/all')
export const fastAddForslag = (id: number, samlingIds: number[]) =>
  request<{ id: number; name: string }>(`/utforska/${id}/add`, {
    method: 'POST',
    body: JSON.stringify({ samlingIds }),
  })
export const refreshForslagPool = () =>
  request<{ message: string }>('/admin/forslag/refresh', { method: 'POST' })
