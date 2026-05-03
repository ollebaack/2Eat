import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getIngredients, createIngredient, deleteIngredient } from '@/lib/api'
import type { Ingredient } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function IngredientsPage() {
  const queryClient = useQueryClient()
  const [toDelete, setToDelete] = useState<Ingredient | null>(null)
  const [newName, setNewName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient deleted')
      setToDelete(null)
    },
    onError: () => toast.error('Failed to delete ingredient'),
  })

  const createMutation = useMutation({
    mutationFn: () => createIngredient({ name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient added')
      setNewName('')
      setShowAdd(false)
    },
    onError: () => toast.error('Failed to add ingredient'),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ingredients</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          New Ingredient
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Allergens</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {ingredients?.map((ingredient) => (
                <tr key={ingredient.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{ingredient.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ingredient.category?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {ingredient.allergens?.length > 0
                        ? ingredient.allergens.map((a) => (
                            <Badge key={a.id} variant="outline" className="text-xs">
                              {a.id}
                            </Badge>
                          ))
                        : <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setToDelete(ingredient)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {(!ingredients || ingredients.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No ingredients yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Ingredient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="ing-name">Name</Label>
            <Input
              id="ing-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Salmon"
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ingredient?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{toDelete?.name}</strong>.
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
