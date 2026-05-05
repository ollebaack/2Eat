import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { updateMe, changePassword, deleteAccount, uploadFile, getFileUrl } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const cardStyle: React.CSSProperties = {
  background: 'var(--paper)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: 24,
  marginBottom: 16,
}

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
  color: 'var(--ink)',
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuth()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadFile(file)
      return updateMe({
        displayName: user!.displayName,
        email: user!.email,
        avatarUrl: uploaded.storedFileName,
      })
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success('Profilbild uppdaterad')
    },
    onError: () => {
      toast.error('Kunde inte ladda upp profilbild')
    },
  })

  const profileMutation = useMutation({
    mutationFn: () =>
      updateMe({ displayName, email, avatarUrl: user?.avatarUrl ?? null }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success('Profil uppdaterad')
    },
    onError: () => {
      toast.error('Kunde inte spara profil')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Lösenord ändrat')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: Error) => {
      if (err.message.startsWith('400')) {
        toast.error('Nuvarande lösenord är felaktigt')
      } else {
        toast.error('Kunde inte ändra lösenord')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout()
      navigate('/login')
    },
    onError: () => {
      toast.error('Kunde inte ta bort konto')
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) avatarMutation.mutate(file)
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    profileMutation.mutate()
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Nytt lösenord måste vara minst 8 tecken')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Lösenorden matchar inte')
      return
    }
    passwordMutation.mutate()
  }

  const initials = (user?.displayName ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (!user) return null

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }} className="sm:px-8">
      <h1
        style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)', marginBottom: 24 }}
      >
        Min profil
      </h1>

      {/* Avatar */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Profilbild</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user.avatarUrl ? (
            <img
              src={getFileUrl(user.avatarUrl)}
              alt={user.displayName}
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--2eat-accent), var(--2eat-accent-deep))',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--paper)',
                fontWeight: 600,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarMutation.isPending}
          >
            {avatarMutation.isPending ? 'Laddar upp…' : 'Byt profilbild'}
          </Button>
        </div>
      </div>

      {/* Profile info */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Kontoinformation</h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName">Visningsnamn</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profileEmail">E-post</Label>
            <Input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="self-start"
            disabled={profileMutation.isPending}
            style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
          >
            {profileMutation.isPending ? 'Sparar…' : 'Spara'}
          </Button>
        </form>
      </div>

      {/* Change password */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Ändra lösenord</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Nytt lösenord</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="self-start"
            disabled={passwordMutation.isPending}
            style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
          >
            {passwordMutation.isPending ? 'Ändrar…' : 'Ändra lösenord'}
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div style={{ ...cardStyle, border: '1px solid #ef444450' }}>
        <h2 style={{ ...sectionHeadingStyle, marginBottom: 8, color: '#ef4444' }}>Farozon</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 16 }}>
          Om du tar bort ditt konto raderas all din data permanent. Denna åtgärd kan inte ångras.
        </p>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Ta bort konto
        </Button>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Är du säker?"
        description="Ditt konto och all data raderas permanent. Det går inte att ångra detta."
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
        confirmLabel={deleteMutation.isPending ? 'Tar bort…' : 'Ta bort'}
      />
    </div>
  )
}
