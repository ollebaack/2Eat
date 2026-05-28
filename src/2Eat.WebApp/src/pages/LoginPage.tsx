import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authLogin } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/auth/AuthLayout'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ email, password })
  }

  return (
    <AuthLayout title="Logga in">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
