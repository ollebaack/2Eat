export interface Recipe {
  id: number;
  name: string;
  description: string;
  instructions: string;
  imageUrl?: string;
  categoryId: number;
  category: Category;
  ingredients: RecipeIngredient[];
  servings: number;
  rating: number;
  cookTime: number;
  prepTime: number;
  totalTime: number;
  lastModified: Date;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  id: number;
  name: string;
  quantity: string;
}
