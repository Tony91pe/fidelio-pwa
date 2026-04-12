import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Email richiesta' }, { status: 400 })

  const customers = await db.customer.findMany({
    where: { email },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          category: true,
          rewardThreshold: true,
          rewardDescription: true,
        },
      },
    },
    orderBy: { points: 'desc' },
  })

  return NextResponse.json(
    customers.map((c: any) => ({
      shopId: c.shopId,
      shopName: c.shop.name,
      category: c.shop.category,
      points: c.points,
      totalVisits: c.totalVisits,
      nextRewardPoints: c.shop.rewardThreshold,
      rewardDescription: c.shop.rewardDescription,
    }))
  )
}
