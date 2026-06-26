import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authRegister } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/auth/AuthLayout'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({})

  const mutation = useMutation({
    mutationFn: authRegister,
    onSuccess: (result) => {
      login(result.token, result.user)
      navigate('/')
    },
    onError: (err: Error) => {
      if (err.message.startsWith('409')) {
        toast.error('Den e-postadressen är redan registrerad')
      } else {
        toast.error('Något gick fel. Försök igen.')
      }
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors: { password?: string; confirmPassword?: string } = {}
    if (password.length < 8) {
      errors.password = 'Lösenordet måste vara minst 8 tecken'
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Lösenorden matchar inte'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error(errors.password ?? errors.confirmPassword)
      return
    }
    mutation.mutate({ email, password, displayName })
  }

  return (
    <AuthLayout title="Skapa konto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">Ditt namn</Label>
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-post</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Lösenord</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }}
              className={cn('pr-10', fieldErrors.password && 'border-destructive focus-visible:ring-destructive')}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {fieldErrors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              className={cn(
                'pr-10',
                fieldErrors.confirmPassword && 'border-destructive focus-visible:ring-destructive',
              )}
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Dölj lösenord' : 'Visa lösenord'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-destructive">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={mutation.isPending}
          style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
        >
          {mutation.isPending ? 'Skapar konto…' : 'Skapa konto'}
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--ink-60)' }}>
        Har du redan konto?{' '}
        <Link to="/login" style={{ color: 'var(--2eat-accent)', textDecoration: 'none', fontWeight: 500 }}>
          Logga in
        </Link>
      </p>
    </AuthLayout>
  )
}
