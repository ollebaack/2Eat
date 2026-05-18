import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <Layout />,
      children: [
        { index: true, element: <UtforskaSida /> },
        { path: '/recept', element: <RecipesPage /> },
        { path: '/recipes/new', element: <RecipeFormPage /> },
        { path: '/recipes/:id', element: <RecipeDetailPage /> },
        { path: '/recipes/:id/edit', element: <RecipeFormPage /> },
        { path: '/ingredients', element: <IngredientsPage /> },
        { path: '/veckoplan', element: <VeckoplanPage /> },
        { path: '/skafferi', element: <SkafferiPage /> },
        { path: '/profile', element: <ProfilePage /> },
        { path: '/settings', element: <SettingsPage /> },
        { path: '/samlingar', element: <SamlingarPage /> },
        { path: '/samlingar/:id', element: <SamlingDetailPage /> },
      ],
    }],
  },
])

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <TooltipProvider delayDuration={400}>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </TooltipProvider>
    </MotionConfig>
  )
}
