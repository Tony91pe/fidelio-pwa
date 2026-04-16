'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/negozio',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#10B981' : 'none'} stroke={active ? '#10B981' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/negozio/scanner',
    label: 'Scan',
    icon: (_active: boolean) => (
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg -mt-4" style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 20px rgba(16,185,129,0.5)' }}>
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
    href: '/negozio/clienti',
    label: 'Clienti',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10B981' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: '/negozio/offerte',
    label: 'Offerte',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10B981' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    href: '/negozio/profilo',
    label: 'Negozio',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10B981' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <path d="M9 22V12h6v10"/>
        <circle cx="12" cy="6" r="1" fill={active ? '#10B981' : 'rgba(255,255,255,0.4)'}/>
      </svg>
    ),
  },
]

export function ShopBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'rgba(10,20,15,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(16,185,129,0.12)' }}
    >
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
              {tab.href !== '/negozio/scanner' && (
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? '#10B981' : 'rgba(255,255,255,0.35)' }}
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
