export const italianCities: Record<string, { lat: number; lng: number }> = {
  'pescara': { lat: 42.4618, lng: 14.2136 },
  'firenze': { lat: 43.7696, lng: 11.2558 },
  'roma': { lat: 41.9028, lng: 12.4964 },
  'milano': { lat: 45.4642, lng: 9.1900 },
  'venezia': { lat: 45.4408, lng: 12.3155 },
  'napoli': { lat: 40.8518, lng: 14.2681 },
  'bologna': { lat: 44.4949, lng: 11.3426 },
  'palermo': { lat: 38.1157, lng: 13.3615 },
  'genova': { lat: 44.4056, lng: 8.9463 },
  'torino': { lat: 45.0703, lng: 7.6869 },
  'verona': { lat: 45.4386, lng: 10.9945 },
  'catania': { lat: 37.5079, lng: 15.0875 },
  'bari': { lat: 41.1171, lng: 16.8718 },
  'messina': { lat: 38.1938, lng: 15.5540 },
  'pisa': { lat: 43.7228, lng: 10.3970 },
  'bergamo': { lat: 45.6979, lng: 9.6745 },
  'ravenna': { lat: 44.4176, lng: 12.1975 },
  'perugia': { lat: 43.1122, lng: 12.3886 },
  'trieste': { lat: 45.6467, lng: 13.7808 },
  'brescia': { lat: 45.5384, lng: 10.2110 },
}

export const getCityCoordinates = (cityName: string): { lat: number; lng: number } | null => {
  const normalized = cityName.toLowerCase().trim()
  return italianCities[normalized] || null
}
