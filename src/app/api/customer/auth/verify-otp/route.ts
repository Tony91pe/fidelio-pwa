import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { otpStore } from '../send-otp/route'

const JWT_SECRET = process.env.JWT_SECRET || 'fidelio-secret-change-in-production'

export async function POST(req: Request) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ error: 'Email e codice richiesti' }, { status: 400 })
  }

  const stored = otpStore.get(email)

  if (!stored) {
    return NextResponse.json({ error: 'Codice non trovato o scaduto' }, { status: 400 })
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(email)
    return NextResponse.json({ error: 'Codice scaduto. Richiedi un nuovo codice.' }, { status: 400 })
  }

  if (stored.code !== code) {
    return NextResponse.json({ error: 'Codice non valido' }, { status: 400 })
  }

  otpStore.delete(email)

  // Find or create customer
  let customer = await db.customer.findFirst({ where: { email } })

  if (!customer) {
    // New customer - create a global record with a unique code
    const code = `FID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    // We need a shopId to create a customer, so we create a "ghost" customer
    // that gets assigned to shops on first scan
    // For now, find the first shop to associate with
    const firstShop = await db.shop.findFirst()
    if (firstShop) {
      customer = await db.customer.create({
        data: {
          email,
          name: email.split('@')[0],
          code,
          shopId: firstShop.id,
          points: 0,
        },
      })
    } else {
      return NextResponse.json({ error: 'Nessun negozio disponibile' }, { status: 400 })
    }
  }

  const token = jwt.sign(
    { customerId: customer.id, email: customer.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  )

  return NextResponse.json({
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      code: customer.code,
      points: customer.points,
      totalVisits: customer.totalVisits,
      lastVisitAt: customer.lastVisitAt,
    },
  })
}
