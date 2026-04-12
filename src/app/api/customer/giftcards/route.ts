import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Email richiesta' }, { status: 400 })

  const customers = await db.customer.findMany({ where: { email } })
  if (!customers.length) return NextResponse.json([])

  // Gift cards are associated to shops — return all from shops the customer visits
  const shopIds = customers.map((c: any) => c.shopId)

  const giftCards = await db.giftCard.findMany({
    where: { shopId: { in: shopIds } },
    include: { shop: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    giftCards.map((gc: any) => ({
      id: gc.id,
      code: gc.code,
      points: gc.points,
      description: gc.description,
      used: gc.used,
      shopName: gc.shop.name,
      shopId: gc.shopId,
    }))
  )
}
