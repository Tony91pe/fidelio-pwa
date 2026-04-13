'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllShops } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { Shop } from '@/types'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-2">
      <div className="text-white/30 text-sm">Caricamento mappa...</div>
    </div>
  ),
})

function ShopListItem({ shop, onSelect }: { shop: Shop; onSelect: () => void }) {
  const cfg = getCategoryConfig(shop.category)
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-3 p-3 rounded-xl w-full text-left hover:bg-white/5 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cfg.color + '22' }}>
        {cfg.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{shop.name}</p>
        <p className="text-xs text-white/40 truncate">{shop.address}, {shop.city}</p>
      </div>
      <span className="text-white/20 text-xs">→</span>
    </button>
  )
}

export default function ScopriPage() {
  const [search, setSearch] = useState('')
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [view, setView] = useState<'map' | 'list'>('map')

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['all-shops'],
    queryFn: () => getAllShops(),
    select: (res) => res.data as Shop[],
  })

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ProtectedLayout>
      <div className="flex flex-col h-dvh pb-20">
        {/* Header */}
        <div className="px-4 pt-6 pb-3 flex-shrink-0">
          <h1 className="font-display font-bold text-2xl mb-3">Scopri</h1>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Cerca negozi, città..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <div className="flex glass rounded-xl overflow-hidden flex-shrink-0">
              <button
                onClick={() => setView('map')}
                className="px-3 py-2 text-sm transition-colors"
                style={{ background: view === 'map' ? 'rgba(124,58,237,0.3)' : 'transparent', color: view === 'map' ? '#A78BFA' : 'rgba(255,255,255,0.4)' }}
              >
                🗺️
              </button>
              <button
                onClick={() => setView('list')}
                className="px-3 py-2 text-sm transition-colors"
                style={{ background: view === 'list' ? 'rgba(124,58,237,0.3)' : 'transparent', color: view === 'list' ? '#A78BFA' : 'rgba(255,255,255,0.4)' }}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'map' ? (
          <div className="flex-1 relative">
            <MapComponent
              shops={filtered}
              selectedShop={selectedShop}
              onSelectShop={setSelectedShop}
            />
            {selectedShop && (
              <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-4 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: getCategoryConfig(selectedShop.category).color + '22' }}
                  >
                    {getCategoryConfig(selectedShop.category).emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{selectedShop.name}</p>
                    <p className="text-xs text-white/40 truncate">{selectedShop.address}</p>
                    <p className="text-xs text-brand-light mt-0.5">{selectedShop.rewardDescription} ogni {selectedShop.rewardThreshold} punti</p>
                  </div>
                  <button onClick={() => setSelectedShop(null)} className="text-white/30 text-xl">×</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {[1,2,3,4,5].map(i => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <p className="text-4xl mb-2">🏪</p>
                <p>Nessun negozio trovato</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map((shop) => (
                  <ShopListItem
                    key={shop.id}
                    shop={shop}
                    onSelect={() => { setSelectedShop(shop); setView('map') }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
