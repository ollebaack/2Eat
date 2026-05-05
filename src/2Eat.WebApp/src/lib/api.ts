import type { FileUpload, Ingredient, PantryItem, Recipe, AllergenId, WeekPlan, WeekPlanDay } from '@/types'

export const ALLERGEN_OPTIONS: AllergenId[] = [
  'Gluten',
  'Vegetariskt',
  'Veganskt',
  'Laktos',
  'Nötter',
]

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T
  return res.json() as Promise<T>
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
export const deleteIngredient = (id: number) =>
  request<Ingredient>(`/ingredients/${id}`, { method: 'DELETE' })

export function uploadFile(file: File): Promise<FileUpload> {
  const form = new FormData()
  form.append('file', file)
  return fetch(`${BASE}/files`, { method: 'POST', body: form }).then((r) => r.json() as Promise<FileUpload>)
}

export const getFileUrl = (storedFileName: string) => `${BASE}/files/${storedFileName}`

export const getWeekPlan = (weekStartDate: string) =>
  request<WeekPlan>(`/mealplan/week/${weekStartDate}`)

export const setDaySlot = (weekStartDate: string, dayOfWeek: number, data: { recipeId: number | null; note: string }) =>
  request<WeekPlanDay>(`/mealplan/week/${weekStartDate}/day/${dayOfWeek}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const clearDaySlot = (weekStartDate: string, dayOfWeek: number) =>
  request<void>(`/mealplan/week/${weekStartDate}/day/${dayOfWeek}`, { method: 'DELETE' })

export const getPantryItems = () => request<PantryItem[]>('/pantry')
export const createPantryItem = (item: Omit<PantryItem, 'id'>) =>
  request<PantryItem>('/pantry', { method: 'POST', body: JSON.stringify(item) })
export const updatePantryItem = (id: number, item: Omit<PantryItem, 'id'>) =>
  request<PantryItem>(`/pantry/${id}`, { method: 'PUT', body: JSON.stringify(item) })
export const deletePantryItem = (id: number) =>
  request<void>(`/pantry/${id}`, { method: 'DELETE' })
