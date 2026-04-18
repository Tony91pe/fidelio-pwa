'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getShops, getMyCode } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { CustomerShop } from '@/types'
import Link from 'next/link'

function getTier(visits: number) {
  if (visits >= 50) return { label: 'Platino', color: '#E5E4E2', emoji: '💎' }
  if (visits >= 25) return { label: 'Oro', color: '#F59E0B', emoji: '🥇' }
  if (visits >= 10) return { label: 'Argento', color: '#9CA3AF', emoji: '🥈' }
  if (visits >= 3)  return { label: 'Bronzo', color: '#CD7C2F', emoji: '🥉' }
  return { label: 'Nuovo', color: '#6C3DF4', emoji: '✨' }
}

function ShopCard({ shop, index }: { shop: CustomerShop; index: number }) {
  const cfg = getCategoryConfig(shop.category)
  const pct = Math.min((shop.points / shop.nextRewardPoints) * 100, 100)
  const remaining = Math.max(shop.nextRewardPoints - shop.points, 0)
  const isComplete = remaining === 0
  const tier = getTier(shop.totalVisits)

  return (
    <div
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: `1px solid ${isComplete ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.07)'}`,
        animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s both`,
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: cfg.color + '0D', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }} />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cfg.color + '1A', border: `1px solid ${cfg.color}33` }}>
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{shop.shopName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{shop.totalVisits} visite</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: tier.color + '22', color: tier.color }}>
              {tier.emoji} {tier.label}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-xl leading-none" style={{ color: '#A78BFA' }}>{shop.points}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>punti</p>
        </div>
      </div>
      <div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', transition: 'width 1s ease' }} />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isComplete ? '🎉 Premio disponibile!' : `Ancora ${remaining} punti al premio`}
          </p>
          <p className="text-[10px] font-medium" style={{ color: isComplete ? '#A78BFA' : 'rgba(255,255,255,0.25)' }}>{Math.round(pct)}%</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { customer } = useAuthStore()

  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['customer-shops', customer?.email],
    queryFn: () => getShops(),
    enabled: !!customer?.email,
    select: (res) => res.data as CustomerShop[],
    refetchInterval: 30_000,
  })

  const { data: myCodeData } = useQuery({
    queryKey: ['my-code', customer?.email],
    queryFn: () => getMyCode(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data.code as string,
  })

  const totalPoints = shopsData?.reduce((s, sh) => s + sh.points, 0) ?? 0
  const totalVisits = shopsData?.reduce((s, sh) => s + sh.totalVisits, 0) ?? 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'
  const code = myCodeData || customer?.code || '—'
  const firstName = customer?.name?.split(' ')[0] || 'Cliente'

  return (
    <ProtectedLayout>
      <div className="px-4 pt-8 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-7" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{greeting} 👋</p>
            <h1 className="font-display font-bold text-2xl leading-tight">{firstName}</h1>
          </div>
          <Link href="/profilo">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}
            >
              {firstName[0]?.toUpperCase()}
            </div>
          </Link>
        </div>

        {/* Hero card */}
        <div
          className="relative rounded-3xl overflow-hidden mb-6 p-5"
          style={{
            background: 'linear-gradient(135deg, #2D1B69 0%, #1A1F5E 60%, #0F1340 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(124,58,237,0.15)', filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(59,130,246,0.1)', filter: 'blur(30px)', transform: 'translate(-30%,30%)' }} />

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1">
              <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Punti totali</p>
              <p className="font-display font-black text-4xl leading-none" style={{ color: '#A78BFA' }}>{totalPoints}</p>
            </div>
            <div className="h-12 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex-1 text-center">
              <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Negozi</p>
              <p className="font-display font-black text-4xl leading-none" style={{ color: '#60A5FA' }}>{shopsData?.length ?? 0}</p>
            </div>
            <div className="h-12 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex-1 text-right">
              <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Visite</p>
              <p className="font-display font-black text-4xl leading-none" style={{ color: '#F0ABFC' }}>{totalVisits}</p>
            </div>
          </div>

          {/* Code */}
          <div className="mb-5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Il tuo codice</p>
            <p className="font-mono font-bold text-base tracking-wider" style={{ color: 'rgba(255,255,255,0.9)' }}>{code}</p>
          </div>

          {/* Quick actions */}
          <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Azioni rapide</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/scan', icon: '📱', label: 'Il mio QR' },
              { href: '/premi', icon: '🎁', label: 'Premi' },
              { href: '/offerte', icon: '🔥', label: 'Offerte' },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href}>
                <div
                  className="py-4 rounded-2xl text-center transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My shops */}
        <div className="flex items-center justify-between mb-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>I miei negozi</h2>
          <Link href="/scopri" className="text-xs font-medium" style={{ color: '#A78BFA' }}>Scopri altri →</Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : !shopsData?.length ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
              animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both',
            }}
          >
            <div className="text-4xl mb-3">🏪</div>
            <p className="font-semibold text-sm mb-1">Nessun negozio ancora</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Vai su "Scopri" e scansiona il QR di un negozio per iniziare</p>
            <Link href="/scopri">
              <div className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                Scopri negozi
              </div>
            </Link>
          </div>
        ) : (
          <div
            className="rounded-2xl px-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}
          >
            {shopsData.map((shop, i) => (
              <div key={shop.shopId} style={{ borderBottom: i < shopsData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <ShopCard shop={shop} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
