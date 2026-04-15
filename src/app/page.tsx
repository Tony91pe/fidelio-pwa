'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getShops, getMyCode } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { CustomerShop } from '@/types'
import Link from 'next/link'

function PointsRing({ points, threshold }: { points: number; threshold: number }) {
  const pct = Math.min((points / threshold) * 100, 100)
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="92" height="92" viewBox="0 0 92 92">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle
        cx="46" cy="46" r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        filter="url(#glow)"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  )
}

function ShopCard({ shop, index }: { shop: CustomerShop; index: number }) {
  const cfg = getCategoryConfig(shop.category)
  const pct = Math.min((shop.points / shop.nextRewardPoints) * 100, 100)
  const remaining = Math.max(shop.nextRewardPoints - shop.points, 0)
  const isComplete = remaining === 0

  return (
    <div
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.07)',
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
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{shop.totalVisits} visite · {cfg.label}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg leading-none" style={{ color: cfg.color }}>{shop.points}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{cfg.plural}</p>
        </div>
      </div>
      <div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.color}CC, ${cfg.color})`, transition: 'width 1s ease' }} />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isComplete ? '🎉 Premio disponibile!' : `Ancora ${remaining} ${cfg.plural} al premio`}
          </p>
          <p className="text-[10px] font-medium" style={{ color: isComplete ? '#34D399' : 'rgba(255,255,255,0.25)' }}>{Math.round(pct)}%</p>
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
  })

  const { data: myCodeData } = useQuery({
    queryKey: ['my-code', customer?.email],
    queryFn: () => getMyCode(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data.code as string,
  })

  const totalPoints = shopsData?.reduce((s, sh) => s + sh.points, 0) ?? 0
  const topShop = shopsData?.[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'
  const code = myCodeData || customer?.code || '—'
  const firstName = customer?.name?.split(' ')[0] || 'Cliente'

  return (
    <ProtectedLayout>
      <div className="px-4 pt-8 pb-24">

        <div className="flex items-center justify-between mb-7" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{greeting} 👋</p>
            <h1 className="font-display font-bold text-2xl leading-tight">{firstName}</h1>
          </div>
          <Link href="/profilo">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
              {firstName[0]?.toUpperCase()}
            </div>
          </Link>
        </div>

        <div
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{
            background: 'linear-gradient(135deg, #3B1F8C 0%, #1A3A6B 60%, #0F2444 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <div className="absolute" style={{ top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div className="absolute" style={{ bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />

          <div className="relative p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-shrink-0">
                <PointsRing points={topShop?.points ?? 0} threshold={topShop?.nextRewardPoints ?? 100} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-black text-2xl leading-none">{totalPoints}</span>
                  <span className="text-[9px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>punti</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Il tuo codice</p>
                <p className="font-mono font-bold text-base tracking-wider truncate" style={{ color: 'rgba(255,255,255,0.95)' }}>{code}</p>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {shopsData?.length ?? 0} {shopsData?.length === 1 ? 'negozio' : 'negozi'} attivi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { href: '/scan', icon: '📷', label: 'Mostra QR' },
                { href: '/premi', icon: '🎁', label: 'Premi' },
                { href: '/offerte', icon: '🔥', label: 'Offerte' },
              ].map(({ href, icon, label }) => (
                <Link key={href} href={href}>
                  <div className="py-3 rounded-xl text-center transition-all active:scale-95" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em' }}>{label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          <h2 className="font-semibold text-sm" style={{ letterSpacing: '0.02em' }}>I miei negozi</h2>
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
              border: '1px dashed rgba(255,255,255,0.1)',
              animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both',
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>🏪</div>
            <p className="font-semibold text-sm mb-1">Nessun negozio ancora</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Visita un negozio Fidelio e scansiona il QR per iniziare</p>
            <Link href="/scopri">
              <div className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                Scopri negozi
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shopsData.map((shop, i) => (
              <ShopCard key={shop.shopId} shop={shop} index={i} />
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
