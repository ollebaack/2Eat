import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authRegister } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/auth/AuthLayout'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
    if (password.length < 8) {
      toast.error('Lösenordet måste vara minst 8 tecken')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Lösenorden matchar inte')
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
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
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
