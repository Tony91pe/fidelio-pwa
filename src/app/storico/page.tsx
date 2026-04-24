'use client'

import { useAuthStore } from '@/store/authStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

const CATEGORY_EMOJI: Record<string, string> = {
  bar: '☕', restaurant: '🍕', hair: '✂️', beauty: '💅',
  gym: '💪', bakery: '🍰', clothing: '👗', bio: '🌿', other: '🏪',
}

const CATEGORY_COLOR: Record<string, string> = {
  bar: '#F59E0B', restaurant: '#EF4444', hair: '#A78BFA', beauty: '#F472B6',
  gym: '#10B981', bakery: '#FB923C', clothing: '#60A5FA', bio: '#34D399', other: '#94A3B8',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Oggi'
  if (diff === 1) return 'Ieri'
  if (diff < 7) return `${diff} giorni fa`
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

interface Visit {
  id: string
  shopName: string
  shopCategory: string
  points: number
  note: string | null
  amount: number | null
  createdAt: string
}

export default function StoricoPage() {
  const { customer } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['visits', customer?.email],
    queryFn: () => api.get('/api/customer/visits', { params: { email: customer?.email } }).then(r => r.data.visits as Visit[]),
    enabled: !!customer?.email,
  })

  const grouped = (data ?? []).reduce<Record<string, Visit[]>>((acc, v) => {
    const key = formatDate(v.createdAt)
    if (!acc[key]) acc[key] = []
    acc[key].push(v)
    return acc
  }, {})

  const totalPts = (data ?? []).reduce((s, v) => s + v.points, 0)

  return (
    <ProtectedLayout>
      <div className="pb-10">
        {/* Header */}
        <div
          className="relative overflow-hidden px-5 pt-14 pb-6"
          style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, transparent 100%)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-36 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.14) 0%, transparent 100%)' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>La tua storia</p>
              <h1 className="font-display font-bold text-2xl leading-tight">Storico visite</h1>
            </div>
            {data && data.length > 0 && (
              <div
                className="px-3 py-2 rounded-xl text-right"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <p className="font-black text-xl leading-none" style={{ color: '#10B981' }}>+{totalPts}</p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'rgba(16,185,129,0.6)' }}>punti totali</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5">
          {isLoading ? (
            <div className="flex flex-col gap-3 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl h-16 shimmer" />
              ))}
            </div>
          ) : !data?.length ? (
            <div
              className="rounded-3xl p-10 text-center mt-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
            >
              <div className="text-5xl mb-4">📭</div>
              <p className="font-bold text-base mb-2">Nessuna visita ancora</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Scansiona il QR di un negozio per iniziare
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 mt-2">
              {Object.entries(grouped).map(([date, visits]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      {date}
                    </p>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <p className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      +{visits.reduce((s, v) => s + v.points, 0)} pt
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    {visits.map((v, i) => {
                      const color = CATEGORY_COLOR[v.shopCategory] ?? '#94A3B8'
                      return (
                        <div
                          key={v.id}
                          className="flex items-center gap-3.5 px-4 py-3.5"
                          style={{
                            background: 'rgba(255,255,255,0.025)',
                            borderBottom: i < visits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background: color + '14', border: `1px solid ${color}22` }}
                          >
                            {CATEGORY_EMOJI[v.shopCategory] ?? '🏪'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-white truncate">{v.shopName}</p>
                            <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                              <span>{formatTime(v.createdAt)}</span>
                              {v.amount != null && <><span>·</span><span>€{v.amount.toFixed(2)}</span></>}
                              {v.note && <><span>·</span><span className="truncate">{v.note}</span></>}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 pl-2">
                            <p className="font-black text-xl leading-none" style={{ color: v.points > 0 ? '#A78BFA' : 'rgba(255,255,255,0.2)' }}>
                              +{v.points}
                            </p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>punti</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}
