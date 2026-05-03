import type { FileUpload, Ingredient, Recipe } from '@/types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
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
