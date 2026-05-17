export interface Category {
  id: number
  name: string
  isDinnerEligible: boolean
}

export type AllergenId = 'Gluten' | 'Vegetariskt' | 'Veganskt' | 'Laktos' | 'Nötter'

export interface Allergen {
  id: AllergenId
}

export type UnitOfMeasurement =
  | 'g' | 'ml' | 'kg' | 'krm' | 'tsk' | 'msk' | 'dl' | 'l' | 'kaffemått' | 'st'
  | 'cup' | 'fl oz' | 'oz' | 'lbs' | 'cl' | 'pinch' | 'tsp' | 'tbsp'

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
  pricePerUnit?: number
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
  isFavorite?: boolean
  category: Category
  categoryId: number
  ingredients: RecipeIngredient[]
  allergens?: Allergen[]
  servings: number
  rating: number
  difficulty?: string
  cookTime: number
  prepTime: number
  totalTime: number
  lastModified: string
  createdAt: string
  calories?: number | null
  protein?: number | null
  fat?: number | null
  carbs?: number | null
}

export interface FileUpload {
  id: number
  fileName: string
  storedFileName: string
  contentType: string
  fileSize: number
  isSuccess: boolean
}

export interface WeekPlanDay {
  id: number
  dayOfWeek: number  // 1=Monday ... 7=Sunday
  recipeId: number | null
  note: string
}

export interface WeekPlan {
  id: number
  weekStartDate: string  // "YYYY-MM-DD"
  days: WeekPlanDay[]
}

export interface ScannedIngredient {
  name: string
  quantity: number
  unit: string
}

export interface ScannedRecipe {
  name?: string | null
  description?: string | null
  steps?: string[] | null
  servings?: number | null
  prepTime?: number | null
  cookTime?: number | null
  difficulty?: string | null
  ingredients?: ScannedIngredient[] | null
  imageUrl?: string | null
  categoryName?: string | null
  calories?: number | null
  protein?: number | null
  fat?: number | null
  carbs?: number | null
  allergens?: string[] | null
}

export interface ScanStatus {
  enabled: boolean
}

export interface PantryItem {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  expiresAt: string | null  // "YYYY-MM-DD" or null
  isOpened: boolean
  isLow: boolean
}

export interface ShoppingListItem {
  id: number
  name: string
  isChecked: boolean
  shoppingListId: number
}

export interface SamlingListItem {
  id: number
  name: string
  receptCount: number
  coverImages: (string | null)[]
  createdAt: string
}

export interface RecipePage {
  items: Recipe[]
  hasMore: boolean
  page: number
}

export interface SamlingReceptItem {
  receptId: number
  order: number
  name: string
  imageUrl?: string | null
  totalTime: number
  servings: number
  rating: number
}

export interface SamlingDetail {
  id: number
  name: string
  createdAt: string
  recept: SamlingReceptItem[]
}

export interface Forslag {
  id: number
  title: string
  imageUrl?: string | null
  sourceUrl: string
  sourceSite: string
}
