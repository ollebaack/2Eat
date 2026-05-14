import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { ProfilePage } from './ProfilePage'
import { IngredientsPage } from './IngredientsPage'
import { useTheme } from '@/hooks/useTheme'

const TABS = [
  { key: 'profil', label: 'Profil' },
  { key: 'ingredienser', label: 'Ingredienser' },
] as const

type TabKey = typeof TABS[number]['key']

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profil')
  const { isDark, setIsDark } = useTheme()

  return (
    <div>
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-line"
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
          {isDark ? 'Mörkt läge' : 'Ljust läge'}
        </span>
        <button
          onClick={() => setIsDark(d => !d)}
          title={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid var(--line)', background: 'transparent',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            color: 'var(--ink-60)',
          }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <div
        className="flex border-b border-line px-4 sm:px-6"
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '14px 12px',
              border: 'none',
              borderBottom: activeTab === tab.key
                ? '2px solid var(--2eat-accent)'
                : '2px solid transparent',
              marginBottom: -1,
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? 'var(--ink)' : 'var(--ink-50)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profil' && <ProfilePage />}
      {activeTab === 'ingredienser' && <IngredientsPage />}
    </div>
  )
}
