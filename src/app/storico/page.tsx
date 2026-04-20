'use client'

import { useAuthStore } from '@/store/authStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

const CATEGORY_EMOJI: Record<string, string> = {
  bar: '☕', restaurant: '🍕', hair: '✂️', beauty: '💅',
  gym: '💪', bakery: '🍰', clothing: '👗', bio: '🌿', other: '🏪',
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

  // Raggruppa per data
  const grouped = (data ?? []).reduce<Record<string, Visit[]>>((acc, v) => {
    const key = formatDate(v.createdAt)
    if (!acc[key]) acc[key] = []
    acc[key].push(v)
    return acc
  }, {})

  return (
    <ProtectedLayout>
      <div className="pb-10">
        {/* Header */}
        <div
          className="px-5 pt-14 pb-6"
          style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.15) 0%, transparent 100%)' }}
        >
          <h1 className="font-display font-bold text-2xl mb-1">Storico visite</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Tutte le tue visite e i punti accumulati
          </p>
        </div>

        <div className="px-5">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
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
                Scansiona il QR di un negozio per iniziare ad accumulare punti
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(grouped).map(([date, visits]) => (
                <div key={date}>
                  <p
                    className="text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {date}
                  </p>
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    {visits.map((v, i) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3.5 px-4 py-3.5"
                        style={{
                          background: 'rgba(255,255,255,0.025)',
                          borderBottom: i < visits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        {/* Icona */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.15)' }}
                        >
                          {CATEGORY_EMOJI[v.shopCategory] ?? '🏪'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{v.shopName}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {formatTime(v.createdAt)}
                            {v.amount ? ` · €${v.amount.toFixed(2)}` : ''}
                            {v.note ? ` · ${v.note}` : ''}
                          </p>
                        </div>

                        {/* Punti */}
                        <div className="text-right flex-shrink-0">
                          <p
                            className="font-black text-lg leading-none"
                            style={{ color: v.points > 0 ? '#A78BFA' : 'rgba(255,255,255,0.3)' }}
                          >
                            +{v.points}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>punti</p>
                        </div>
                      </div>
                    ))}
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
