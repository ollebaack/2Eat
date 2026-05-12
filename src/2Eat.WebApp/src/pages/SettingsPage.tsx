import { useState } from 'react'
import { ProfilePage } from './ProfilePage'
import { IngredientsPage } from './IngredientsPage'

const TABS = [
  { key: 'profil', label: 'Profil' },
  { key: 'ingredienser', label: 'Ingredienser' },
] as const

type TabKey = typeof TABS[number]['key']

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profil')

  return (
    <div>
      <div
        style={{
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          padding: '0 24px',
        }}
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
