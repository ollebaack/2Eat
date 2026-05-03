import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { Layout } from '@/components/layout/Layout'
import { RecipesPage } from '@/pages/RecipesPage'
import { RecipeDetailPage } from '@/pages/RecipeDetailPage'
import { RecipeFormPage } from '@/pages/RecipeFormPage'
import { IngredientsPage } from '@/pages/IngredientsPage'
import { VeckoplanPage } from '@/pages/VeckoplanPage'
import { SkafferiPage } from '@/pages/SkafferiPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<RecipesPage />} />
            <Route path="recipes/new" element={<RecipeFormPage />} />
            <Route path="recipes/:id" element={<RecipeDetailPage />} />
            <Route path="recipes/:id/edit" element={<RecipeFormPage />} />
            <Route path="ingredients" element={<IngredientsPage />} />
            <Route path="veckoplan" element={<VeckoplanPage />} />
            <Route path="skafferi" element={<SkafferiPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}
