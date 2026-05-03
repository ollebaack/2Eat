import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Shuffle, Clock, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipes, getRandomRecipes, deleteRecipe, getFileUrl } from '@/lib/api'
import type { Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: (r: Recipe) => void }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Link to={`/recipes/${recipe.id}`} className="group block overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={getFileUrl(recipe.imageUrl)}
            alt={recipe.name}
            className="h-44 w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-muted text-4xl">🍽</div>
        )}
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/recipes/${recipe.id}`} className="font-semibold hover:underline line-clamp-1">
            {recipe.name}
          </Link>
          {recipe.category && (
            <Badge variant="secondary" className="shrink-0">
              {recipe.category.name}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t px-4 py-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.totalTime} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {recipe.rating}/5
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(recipe)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardContent className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export function RecipesPage() {
  const queryClient = useQueryClient()
  const [randomCount] = useState(6)
  const [showRandom, setShowRandom] = useState(false)
  const [toDelete, setToDelete] = useState<Recipe | null>(null)

  const { data: allRecipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: getRecipes,
    enabled: !showRandom,
  })

  const { data: randomRecipes, isLoading: randomLoading, refetch: refetchRandom } = useQuery({
    queryKey: ['recipes', 'random', randomCount],
    queryFn: () => getRandomRecipes(randomCount),
    enabled: showRandom,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe deleted')
      setToDelete(null)
    },
    onError: () => toast.error('Failed to delete recipe'),
  })

  const recipes = showRandom ? randomRecipes : allRecipes
  const loading = showRandom ? randomLoading : isLoading

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowRandom((v) => !v)
              if (showRandom) void refetchRandom()
            }}
          >
            <Shuffle className="h-4 w-4" />
            {showRandom ? 'Show All' : 'Random'}
          </Button>
          <Button asChild>
            <Link to="/recipes/new">
              <Plus className="h-4 w-4" />
              New Recipe
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : recipes && recipes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onDelete={setToDelete} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <span className="text-5xl">🍽</span>
          <p>No recipes yet.</p>
          <Button asChild>
            <Link to="/recipes/new">Add your first recipe</Link>
          </Button>
        </div>
      )}

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete recipe?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{toDelete?.name}</strong>. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
