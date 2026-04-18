'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#7C3AED' : 'none'} stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/scopri',
    label: 'Scopri',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/scan',
    label: 'Scan',
    icon: (_active: boolean) => (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center shadow-lg -mt-4 glow-brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <path d="M14 14h2v2h-2zM18 14h3M18 18v3M14 18h2v2"/>
        </svg>
      </div>
    ),
  },
  {
    href: '/premi',
    label: 'Premi',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <polyline points="20 12 20 22 4 22 4 12"/>
        <rect x="2" y="7" width="20" height="5" rx="1"/>
        <line x1="12" y1="22" x2="12" y2="7"/>
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
      </svg>
    ),
  },
  {
    href: '/profilo',
    label: 'Profilo',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav" style={{ background: 'rgba(12,10,26,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(124,58,237,0.15)' }}>
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1"
            >
              {tab.icon(active)}
              {tab.href !== '/scan' && (
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? '#7C3AED' : 'rgba(255,255,255,0.35)' }}
                >
                  {tab.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
