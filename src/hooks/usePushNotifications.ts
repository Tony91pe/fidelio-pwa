'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const { customer } = useAuthStore()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      setSubscribed(Notification.permission === 'granted')
    }
  }, [])

  async function subscribe() {
    if (!customer?.email) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customer.email, subscription: sub.toJSON() }),
      })

      setSubscribed(true)
    } catch (err) {
      console.error('Push subscription error:', err)
    }
  }

  return { permission, subscribed, subscribe }
}