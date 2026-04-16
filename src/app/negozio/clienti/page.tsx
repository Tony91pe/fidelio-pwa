'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { getShopCustomers, getShopCustomerDetail } from '@/lib/api'
import { ShopCustomer } from '@/types'

function CustomerCard({ customer, onClick }: { customer: ShopCustomer; onClick: () => void }) {
  const lastVisit = customer.lastVisitAt
    ? new Date(customer.lastVisitAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Mai'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl text-left transition-all active:scale-98"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
      >
        {customer.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{customer.name}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{customer.email}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-base" style={{ color: '#10B981' }}>{customer.points}</p>
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>punti</p>
      </div>
    </button>
  )
}

function CustomerDetailModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['shop-customer-detail', customerId],
    queryFn: () => getShopCustomerDetail(customerId).then((r) => r.data),
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: '#0D1F17', border: '1px solid rgba(16,185,129,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-xl animate-pulse mx-auto" style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }} />
          </div>
        ) : data ? (
          <>
            <div className="p-5 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
                >
                  {data.customer.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-display font-bold text-lg">{data.customer.name}</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{data.customer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <p className="font-bold text-xl" style={{ color: '#10B981' }}>{data.customer.points}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Punti</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)' }}>
                  <p className="font-bold text-xl" style={{ color: '#60A5FA' }}>{data.customer.totalVisits}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Visite</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                  <p className="font-bold text-xl" style={{ color: '#A78BFA' }}>{data.checkins?.length ?? 0}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Check-in</p>
                </div>
              </div>

              <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Storico visite
              </p>
              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', maxHeight: 200, overflowY: 'auto' }}>
                {data.checkins?.length ? data.checkins.slice(0, 10).map((c: { id: string; points: number; amount: number | null; createdAt: string }, i: number) => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2.5" style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {new Date(c.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-3">
                      {c.amount && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>€{c.amount.toFixed(2)}</p>}
                      <p className="text-xs font-bold" style={{ color: '#10B981' }}>+{c.points} pt</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Nessun check-in</p>
                )}
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Chiudi
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function ShopClientiPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: customers, isLoading } = useQuery<ShopCustomer[]>({
    queryKey: ['shop-customers', search],
    queryFn: () => getShopCustomers(search || undefined).then((r) => r.data),
    staleTime: 30_000,
  })

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        {/* Header */}
        <div className="mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 className="font-display font-bold text-2xl mb-1">Clienti</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {customers?.length ?? 0} clienti nel tuo negozio
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Cerca per nome o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : !customers?.length ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <div className="text-4xl mb-3">👥</div>
            <p className="font-semibold text-sm mb-1">
              {search ? 'Nessun cliente trovato' : 'Nessun cliente ancora'}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {search ? 'Prova con un altro termine' : 'I clienti appariranno dopo il primo check-in'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            {customers.map((c) => (
              <CustomerCard key={c.id} customer={c} onClick={() => setSelectedId(c.id)} />
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <CustomerDetailModal customerId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </ShopProtectedLayout>
  )
}
