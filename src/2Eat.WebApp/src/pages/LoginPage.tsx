import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authLogin } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const mutation = useMutation({
    mutationFn: authLogin,
    onSuccess: (result) => {
      login(result.token, result.user)
      navigate('/')
    },
    onError: (error: Error) => {
      if (error.message.startsWith('401')) {
        toast.error('Fel e-post eller lösenord')
      } else {
        toast.error('Kunde inte nå servern. Försök igen.')
      }
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const emailVal = (form.elements.namedItem('email') as HTMLInputElement | null)?.value ?? email
    const passwordVal = (form.elements.namedItem('password') as HTMLInputElement | null)?.value ?? password

    const errors: { email?: string; password?: string } = {}
    if (!emailVal) {
      errors.email = 'Ange din e-postadress'
    }
    if (!passwordVal) {
      errors.password = 'Ange ditt lösenord'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    mutation.mutate({ email: emailVal, password: passwordVal })
  }

  return (
    <AuthLayout title="Logga in">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-post</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }}
            className={cn(fieldErrors.email && 'border-destructive focus-visible:ring-destructive')}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Lösenord</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
          <Button
            type="button"
            variant="link"
            className="self-end h-auto p-0 text-xs"
            onClick={() =>
              toast.info('Kontakta support på ollebaack@gmail.com för att återställa ditt lösenord.')
            }
          >
            Glömt lösenord?
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={mutation.isPending}
          style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
        >
          {mutation.isPending ? 'Loggar in…' : 'Logga in'}
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--ink-60)' }}>
        Inget konto?{' '}
        <Link to="/register" style={{ color: 'var(--2eat-accent)', textDecoration: 'none', fontWeight: 500 }}>
          Registrera dig
        </Link>
      </p>
    </AuthLayout>
  )
}
