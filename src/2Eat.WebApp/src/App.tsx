import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { RecipesPage } from '@/pages/RecipesPage'
import { RecipeDetailPage } from '@/pages/RecipeDetailPage'
import { RecipeFormPage } from '@/pages/RecipeFormPage'
import { IngredientsPage } from '@/pages/IngredientsPage'
import { VeckoplanPage } from '@/pages/VeckoplanPage'
import { SkafferiPage } from '@/pages/SkafferiPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SamlingarPage } from '@/pages/SamlingarPage'
import { SamlingDetailPage } from '@/pages/SamlingDetailPage'
import { UtforskaSida } from '@/pages/UtforskaSida'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <TooltipProvider delayDuration={400}>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<RecipesPage />} />
                <Route path="utforska" element={<UtforskaSida />} />
                <Route path="recipes/new" element={<RecipeFormPage />} />
                <Route path="recipes/:id" element={<RecipeDetailPage />} />
                <Route path="recipes/:id/edit" element={<RecipeFormPage />} />
                <Route path="ingredients" element={<IngredientsPage />} />
                <Route path="veckoplan" element={<VeckoplanPage />} />
                <Route path="skafferi" element={<SkafferiPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="samlingar" element={<SamlingarPage />} />
                <Route path="samlingar/:id" element={<SamlingDetailPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </TooltipProvider>
    </MotionConfig>
  )
}
