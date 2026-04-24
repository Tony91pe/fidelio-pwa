'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#7C3AED' : 'none'} stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const DiscoverIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const GiftIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5" rx="1"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7C3AED' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const QrIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="3" height="3" rx="0.5"/>
    <path d="M18 14v1M21 14v3h-3M21 21h-3v-3"/>
  </svg>
)

const tabs = [
  { href: '/',        label: 'Home',    Icon: HomeIcon },
  { href: '/scopri',  label: 'Scopri',  Icon: DiscoverIcon },
  { href: '/scan',    label: '',        Icon: null },
  { href: '/premi',   label: 'Premi',   Icon: GiftIcon },
  { href: '/profilo', label: 'Profilo', Icon: ProfileIcon },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav"
      style={{
        background: 'rgba(10,9,22,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-around px-1 pt-2 pb-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          const isScan = tab.href === '/scan'

          if (isScan) return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center min-w-[56px] -mt-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.55), 0 0 0 1px rgba(167,139,250,0.2)',
                }}
              >
                <QrIcon />
              </div>
            </Link>
          )

          const { Icon } = tab
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1 relative"
            >
              {/* Active indicator bar */}
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: active ? 20 : 0,
                  height: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
                  transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: active ? '0 0 8px rgba(124,58,237,0.7)' : 'none',
                }}
              />
              {Icon && (
                <div className={active ? 'drop-shadow-[0_0_6px_rgba(124,58,237,0.6)]' : ''}>
                  <Icon active={active} />
                </div>
              )}
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{
                  color: active ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                  letterSpacing: active ? '0.03em' : '0',
                }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
