'use client'

import { useQuery } from '@tanstack/react-query'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { getShopStats } from '@/lib/api'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { ShopStats, ShopCheckin } from '@/types'
import Link from 'next/link'

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
      <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>}
    </div>
  )
}

function CheckinRow({ checkin, index }: { checkin: ShopCheckin; index: number }) {
  const time = new Date(checkin.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(checkin.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })

  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{
        borderBottom: index > 0 ? 'none' : undefined,
        animation: `slideUp 0.35s cubic-bezier(0.16,1,0.3,1) ${index * 0.05}s both`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-bold"
        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
      >
        {checkin.customerName?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{checkin.customerName || 'Cliente'}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{checkin.customerCode}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: '#10B981' }}>+{checkin.points} pt</p>
        {checkin.amount && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>€{checkin.amount.toFixed(2)}</p>}
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{date} {time}</p>
      </div>
    </div>
  )
}

export default function ShopDashboard() {
  const { shop, shopUser } = useShopAuthStore()

  const { data: stats, isLoading } = useQuery<ShopStats>({
    queryKey: ['shop-stats'],
    queryFn: () => getShopStats().then((r) => r.data),
    refetchInterval: 30_000,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-7" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{greeting} 👋</p>
            <h1 className="font-display font-bold text-2xl leading-tight">{shop?.name || 'Il tuo negozio'}</h1>
          </div>
          <Link href="/negozio/profilo">
            <div
              className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
            >
              {shop?.logo
                ? <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                : shopUser?.name?.[0]?.toUpperCase() || '🏪'
              }
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div
          className="relative rounded-3xl overflow-hidden mb-6 p-5"
          style={{
            background: 'linear-gradient(135deg, #0D3B2A 0%, #0A2A1F 60%, #071A12 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(16,185,129,0.1)', filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />
          <p className="text-xs font-medium mb-4" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Azioni rapide</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/negozio/scanner', icon: '📷', label: 'Scansiona' },
              { href: '/negozio/gift-card', icon: '🎁', label: 'Gift Card' },
              { href: '/negozio/premi', icon: '🏆', label: 'Premi' },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href}>
                <div
                  className="py-4 rounded-2xl text-center transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Statistiche</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            <StatCard label="Clienti totali" value={stats?.totalCustomers ?? 0} color="#10B981" />
            <StatCard label="Punti distribuiti" value={stats?.totalPointsIssued ?? 0} color="#A78BFA" />
            <StatCard label="Visite oggi" value={stats?.totalVisitsToday ?? 0} sub={`${stats?.totalVisitsWeek ?? 0} questa settimana`} color="#60A5FA" />
            <StatCard label="Visite mese" value={stats?.totalVisitsMonth ?? 0} color="#F59E0B" />
          </div>
        )}

        {/* Recent Check-ins */}
        <div className="flex items-center justify-between mb-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
          <h2 className="font-semibold text-sm" style={{ letterSpacing: '0.02em' }}>Ultimi check-in</h2>
          <Link href="/negozio/clienti" className="text-xs font-medium" style={{ color: '#10B981' }}>
            Vedi tutti →
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse mx-4 my-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : !stats?.recentCheckins?.length ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-sm mb-1">Nessun check-in ancora</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Scansiona il QR di un cliente per iniziare
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl px-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
          >
            {stats.recentCheckins.slice(0, 8).map((c, i) => (
              <CheckinRow key={c.id} checkin={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </ShopProtectedLayout>
  )
}
