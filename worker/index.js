self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Fidelio', body: event.data.text() } }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Fidelio', {
      body: data.body || '',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-96x96.svg',
      ...(data.url && { data: { url: data.url } }),
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url
  if (url) event.waitUntil(clients.openWindow(url))
})
