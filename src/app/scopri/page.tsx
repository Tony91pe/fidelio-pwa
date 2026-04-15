'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllShops } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { getCityCoordinates, geocodeCity } from '@/lib/cities'
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
  const [detail, setDetail] = React.useState<any>(null)
  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/app/shops/${shop.id}`)
      .then(r => r.json()).then(setDetail).catch(() => {})
  }, [shop.id])
  const s = detail ?? shop
return (
    <div className="absolute bottom-4 left-4 right-4 animate-slide-up" style={{ background: 'rgba(22,22,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '16px', backdropFilter: 'blur(20px)', maxHeight: '60vh', overflowY: 'auto' }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {s.logo
            ? <img src={s.logo} alt={s.name} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
            : <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: cfg.color + '22' }}>{cfg.emoji}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate">{s.name}</p>
          <p className="text-xs text-white/40 truncate mt-0.5">{s.address}, {s.city}</p>
          {s.phone && <p className="text-xs text-white/40 mt-0.5">📞 {s.phone}</p>}
          {s.description && <p className="text-xs text-white/60 mt-1 line-clamp-2">{s.description}</p>}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ background: cfg.color + '22', color: cfg.color }}>{cfg.label}</span>
            <span className="text-xs text-white/50">{s.rewardDescription} ogni {s.rewardThreshold} punti</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-white/40">Punti per visita</p>
              <p className="font-bold text-white">{s.pointsPerVisit}</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-white/40">Premio a</p>
              <p className="font-bold text-white">{s.rewardThreshold} pt</p>
            </div>
          </div>
          {detail?.rewards?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-white/40 mb-1">🎁 Premi disponibili</p>
              <div className="flex flex-col gap-1">
                {detail.rewards.map((r: any) => (
                  <div key={r.id} className="flex justify-between items-center rounded-lg px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-xs text-white">{r.title}</span>
                    <span className="text-xs font-bold" style={{ color: cfg.color }}>{r.pointsCost} pt</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
  const [centerCity, setCenterCity] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['all-shops'],
    queryFn: () => getAllShops(),
    select: (res) => res.data as Shop[],
  })

  const filtered = shops.filter(
    (s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(s.category)

      return matchesSearch && matchesCategory
    }
  )

  // Quando la ricerca trova un solo negozio, selezionalo automaticamente
  useEffect(() => {
    if (search.length > 1 && filtered.length === 1) {
      setSelectedShop(filtered[0])
      setView('map')
    } else if (search.length === 0) {
      setSelectedShop(null)
      setCenterCity(null)
    } else if (filtered.length === 0 && search.length > 2) {
      // Geocoding con Nominatim per qualsiasi città italiana
      const timer = setTimeout(async () => {
        const cityCoords = await geocodeCity(search)
        if (cityCoords) {
          setCenterCity(cityCoords)
          setView('map')
        } else {
          setCenterCity(null)
        }
      }, 600) // debounce 600ms
      return () => clearTimeout(timer)
    } else {
      setCenterCity(null)
    }
  }, [search, filtered.length])

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
            <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Cerca negozi, città..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none text-white"
                style={{ fontSize: '16px', fontFamily: 'inherit' }}
              />
            </div>
            <button
              onClick={handleGPS}
              disabled={locating}
              title={locating ? 'Localizzazione in corso...' : userLocation ? 'Localizzazione trovata' : 'Cerca la tua posizione'}
              className="px-3 rounded-xl flex-shrink-0 transition-all"
              style={{
                background: userLocation ? 'rgba(16,185,129,0.2)' : locating ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: userLocation ? '#10B981' : locating ? '#A78BFA' : 'rgba(255,255,255,0.6)',
                cursor: locating ? 'loading' : 'pointer',
                fontSize: '18px',
                padding: '10px'
              }}
            >
              {locating ? '⏳' : userLocation ? '✅' : '📍'}
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

          {/* Filtri categoria */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {['bar', 'pizzeria', 'ristorante', 'parrucchiere', 'estetista', 'palestra', 'farmacia', 'negozio', 'supermercato'].map((category) => {
              const cfg = getCategoryConfig(category)
              const isSelected = selectedCategories.includes(category)
              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )
                  }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    background: isSelected ? cfg.color : 'rgba(255,255,255,0.06)',
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                    border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              )
            })}
          </div>

          {/* Risultati ricerca */}
          {search.length > 1 && filtered.length > 0 && view === 'map' && (
            <div className="rounded-xl overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {filtered.slice(0, 4).map((shop) => {
                const cfg = getCategoryConfig(shop.category)
                return (
                  <button
                    key={shop.id}
                    onClick={() => { handleSelectShop(shop); setSearch('') }}
                    className="flex items-center gap-3 p-3 w-full text-left"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-lg">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{shop.name}</p>
                      <p className="text-xs text-white/40 truncate">{shop.city}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {view === 'map' ? (
          <div className="flex-1 relative">
            <MapComponent
              shops={filtered}
              selectedShop={selectedShop}
              onSelectShop={setSelectedShop}
              userLocation={userLocation}
              centerCity={centerCity}
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
