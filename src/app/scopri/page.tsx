'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllShops } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { Shop } from '@/types'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0F0F1A' }}>
      <div className="text-white/30 text-sm">Caricamento mappa...</div>
    </div>
  ),
})

function ShopDetail({ shop, onClose }: { shop: Shop; onClose: () => void }) {
  const cfg = getCategoryConfig(shop.category)
  return (
    <div className="absolute bottom-4 left-4 right-4 animate-slide-up" style={{ background: 'rgba(22,22,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '16px', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: cfg.color + '22' }}>
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate">{shop.name}</p>
          <p className="text-xs text-white/40 truncate mt-0.5">{shop.address}, {shop.city}</p>
          {shop.phone && <p className="text-xs text-white/40 mt-0.5">📞 {shop.phone}</p>}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ background: cfg.color + '22', color: cfg.color }}>{cfg.label}</span>
            <span className="text-xs text-white/50">{shop.rewardDescription} ogni {shop.rewardThreshold} punti</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-white/40">Punti per visita</p>
              <p className="font-bold text-white">{shop.pointsPerVisit}</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-white/40">Premio a</p>
              <p className="font-bold text-white">{shop.rewardThreshold} pt</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/30 text-2xl leading-none flex-shrink-0">×</button>
      </div>
    </div>
  )
}

export default function ScopriPage() {
  const [search, setSearch] = useState('')
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)

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

  function handleGPS() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSelectShop = useCallback((shop: Shop) => {
    setSelectedShop(shop)
    setView('map')
  }, [])

  return (
    <ProtectedLayout>
      <div className="flex flex-col h-dvh pb-20">
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
            <button
              onClick={handleGPS}
              disabled={locating}
              className="px-3 rounded-xl flex-shrink-0"
              style={{ background: userLocation ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: userLocation ? '#10B981' : 'rgba(255,255,255,0.6)' }}
            >
              {locating ? '⏳' : '📍'}
            </button>
            <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
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

        {view === 'map' ? (
          <div className="flex-1 relative">
            <MapComponent
              shops={filtered}
              selectedShop={selectedShop}
              onSelectShop={setSelectedShop}
              userLocation={userLocation}
            />
            {selectedShop && (
              <ShopDetail shop={selectedShop} onClose={() => setSelectedShop(null)} />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {[1,2,3,4,5].map(i => <div key={i} className="rounded-xl h-16 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <p className="text-4xl mb-2">🏪</p>
                <p>Nessun negozio trovato</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map((shop) => {
                  const cfg = getCategoryConfig(shop.category)
                  return (
                    <button
                      key={shop.id}
                      onClick={() => handleSelectShop(shop)}
                      className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors"
                      style={{ background: 'transparent' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cfg.color + '22' }}>
                        {cfg.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{shop.name}</p>
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{shop.address}, {shop.city}</p>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>→</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
