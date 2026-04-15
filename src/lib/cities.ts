export const italianCities: Record<string, { lat: number; lng: number }> = {
  'pescara': { lat: 42.4618, lng: 14.2136 },
  'roma': { lat: 41.9028, lng: 12.4964 },
  'milano': { lat: 45.4642, lng: 9.1900 },
  'napoli': { lat: 40.8518, lng: 14.2681 },
  'torino': { lat: 45.0703, lng: 7.6869 },
  'firenze': { lat: 43.7696, lng: 11.2558 },
  'bologna': { lat: 44.4949, lng: 11.3426 },
  'bari': { lat: 41.1171, lng: 16.8718 },
  'venezia': { lat: 45.4408, lng: 12.3155 },
  'palermo': { lat: 38.1157, lng: 13.3615 },
}

export const getCityCoordinates = (cityName: string): { lat: number; lng: number } | null => {
  const normalized = cityName.toLowerCase().trim()
  return italianCities[normalized] || null
}

// Geocoding via Nominatim (OpenStreetMap) - qualsiasi città/paese italiano
export const geocodeCity = async (cityName: string): Promise<{ lat: number; lng: number } | null> => {
  // Prima controlla cache locale
  const normalized = cityName.toLowerCase().trim()
  if (italianCities[normalized]) return italianCities[normalized]

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)},Italia&format=json&limit=1&countrycodes=it`,
      { headers: { 'Accept-Language': 'it', 'User-Agent': 'Fidelio/1.0' } }
    )
    const data = await res.json()
    if (data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      // Salva in cache
      italianCities[normalized] = coords
      return coords
    }
    return null
  } catch {
    return null
  }
}
