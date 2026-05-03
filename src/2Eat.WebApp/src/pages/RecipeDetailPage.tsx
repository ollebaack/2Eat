import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock, Users, Star, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipeById, deleteRecipe, getFileUrl } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipes', Number(id)],
    queryFn: () => getRecipeById(Number(id)),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRecipe(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe deleted')
      navigate('/')
    },
    onError: () => toast.error('Failed to delete recipe'),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-muted-foreground">
        <p>Recipe not found.</p>
        <Button asChild variant="outline">
          <Link to="/">Back to recipes</Link>
        </Button>
      </div>
    )
  }

  const sortedIngredients = [...(recipe.ingredients ?? [])].sort((a, b) => a.order - b.order)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="flex-1 text-2xl font-bold">{recipe.name}</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/recipes/${recipe.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete recipe?</DialogTitle>
              <DialogDescription>
                This will permanently delete <strong>{recipe.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {}}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {recipe.imageUrl && (
        <img
          src={getFileUrl(recipe.imageUrl)}
          alt={recipe.name}
          className="h-72 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {recipe.category && <Badge variant="secondary">{recipe.category.name}</Badge>}
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {recipe.prepTime} min prep + {recipe.cookTime} min cook = {recipe.totalTime} min total
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {recipe.servings} servings
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="h-4 w-4" />
          {recipe.rating}/5
        </span>
      </div>

      <p className="text-muted-foreground">{recipe.description}</p>

      <Separator />

      {sortedIngredients.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <ul className="flex flex-col gap-2">
            {sortedIngredients.map((ri) => (
              <li key={ri.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-[80px] font-medium text-foreground">
                  {ri.ingredientMeasurement?.quantity} {ri.ingredientMeasurement?.unit}
                </span>
                <span>{ri.ingredient?.name}</span>
                {ri.ingredient?.allergens?.map((a) => (
                  <Badge key={a.id} variant="outline" className="text-xs">
                    {a.id}
                  </Badge>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{recipe.instructions}</p>
      </section>
    </div>
  )
}
