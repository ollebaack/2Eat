export interface Category {
  id: number
  name: string
}

export type AllergenId = 'Gluten' | 'Vegetariskt' | 'Veganskt' | 'Laktos' | 'Nötter'

export interface Allergen {
  id: AllergenId
}

export type UnitOfMeasurement = 'g' | 'ml' | 'kg' | 'krm' | 'tsk' | 'msk' | 'dl' | 'l' | 'kaffemått' | 'st'

export interface IngredientMeasurement {
  id: number
  quantity: number
  unit: UnitOfMeasurement
}

export interface Ingredient {
  id: number
  name: string
  category: Category
  categoryId: number
  allergens: Allergen[]
}

export interface RecipeIngredient {
  id: number
  order: number
  ingredient: Ingredient
  ingredientId: number
  ingredientMeasurement: IngredientMeasurement
  ingredientMeasurementId: number
}

export interface Recipe {
  id: number
  name: string
  description: string
  instructions: string
  imageUrl?: string
  category: Category
  categoryId: number
  ingredients: RecipeIngredient[]
  servings: number
  rating: number
  difficulty?: string
  cookTime: number
  prepTime: number
  totalTime: number
  lastModified: string
  createdAt: string
}

export interface FileUpload {
  id: number
  fileName: string
  storedFileName: string
  contentType: string
  fileSize: number
  isSuccess: boolean
}
