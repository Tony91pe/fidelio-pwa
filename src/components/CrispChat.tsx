'use client'

import { useEffect } from 'react'

export function CrispChat() {
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
  useEffect(() => {
    if (!websiteId) return
    ;(window as { CRISP_WEBSITE_ID?: string }).CRISP_WEBSITE_ID = websiteId
    const s = document.createElement('script')
    s.src = 'https://client.crisp.chat/l.js'
    s.async = true
    document.head.appendChild(s)
  }, [websiteId])
  return null
}
