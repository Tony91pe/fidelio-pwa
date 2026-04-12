import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Email richiesta' }, { status: 400 })

  const customers = await db.customer.findMany({ where: { email } })
  if (!customers.length) return NextResponse.json([])

  const customerIds = customers.map((c: any) => c.id)

  const rewards = await db.redemption.findMany({
    where: { customerId: { in: customerIds } },
    include: { shop: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(
    rewards.map((r: any) => ({
      id: r.id,
      description: r.rewardDescription,
      shopName: r.shop.name,
      createdAt: r.createdAt,
    }))
  )
}
