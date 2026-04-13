'use client'

import { useEffect, useRef } from 'react'
import { Shop } from '@/types'
import { getCategoryConfig } from '@/lib/categories'

interface Props {
  shops: Shop[]
  selectedShop: Shop | null
  onSelectShop: (shop: Shop) => void
  userLocation?: { lat: number; lng: number } | null
}

export default function MapComponent({ shops, selectedShop, onSelectShop, userLocation }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return
    initializedRef.current = true

    const initMap = async () => {
      const L = await import('leaflet')
      // @ts-ignore
      await import('leaflet/dist/leaflet.css')
      if (!containerRef.current) return

      const map = L.map(containerRef.current, {
        center: [42.3498, 13.3995],
        zoom: 10,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      mapRef.current = { map, L }
    }

    initMap()

    return () => {
      if (mapRef.current?.map) {
        mapRef.current.map.remove()
        mapRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (!shops.length) return

    const addMarkers = () => {
      if (!mapRef.current) { setTimeout(addMarkers, 200); return }
      const { map, L } = mapRef.current

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const shopsWithCoords = shops.filter((s) => s.lat && s.lng)

      shopsWithCoords.forEach((shop) => {
        const cfg = getCategoryConfig(shop.category)
        const isSelected = selectedShop?.id === shop.id

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width:${isSelected ? '48px' : '38px'};
            height:${isSelected ? '48px' : '38px'};
            border-radius:50%;
            background:${isSelected ? cfg.color : cfg.color + '99'};
            border:2px solid ${isSelected ? 'white' : cfg.color};
            display:flex;align-items:center;justify-content:center;
            font-size:${isSelected ? '20px' : '16px'};
            box-shadow:0 4px 12px ${cfg.color}66;
            cursor:pointer;
          ">${cfg.emoji}</div>`,
          iconSize: [isSelected ? 48 : 38, isSelected ? 48 : 38],
          iconAnchor: [isSelected ? 24 : 19, isSelected ? 24 : 19],
        })

        const marker = L.marker([shop.lat!, shop.lng!], { icon })
          .addTo(map)
          .on('click', () => onSelectShop(shop))

        markersRef.current.push(marker)
      })

      if (shopsWithCoords.length > 0 && !selectedShop && !userLocation) {
        const bounds = L.latLngBounds(shopsWithCoords.map((s) => [s.lat!, s.lng!]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    addMarkers()
  }, [shops, selectedShop, onSelectShop, userLocation])

  useEffect(() => {
    if (!mapRef.current || !selectedShop?.lat || !selectedShop?.lng) return
    mapRef.current.map.flyTo([selectedShop.lat, selectedShop.lng], 15, { duration: 0.8 })
  }, [selectedShop])

  useEffect(() => {
    if (!mapRef.current || !userLocation) return
    const { map, L } = mapRef.current

    if (userMarkerRef.current) userMarkerRef.current.remove()

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width:20px;height:20px;border-radius:50%;
        background:#3B82F6;border:3px solid white;
        box-shadow:0 0 0 4px rgba(59,130,246,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(map)
    map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1 })
  }, [userLocation])

  return <div ref={containerRef} className="w-full h-full" />
}
