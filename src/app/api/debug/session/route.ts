import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        gymId: true,
        firstName: true,
        lastName: true,
        gym: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    const planCount = await prisma.membershipPlan.count({
      where: { gymId: session.user.gymId },
    })

    const activePlans = await prisma.membershipPlan.findMany({
      where: {
        gymId: session.user.gymId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        isActive: true,
        gymId: true,
      },
    })

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        gymId: session.user.gymId,
      },
      database: {
        user,
        totalPlans: planCount,
        activePlans,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
