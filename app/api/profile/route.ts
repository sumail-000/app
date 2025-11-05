import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PERFORMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse JSON fields for response
    const profileResponse = {
      ...profile,
      services: profile.services ? JSON.parse(profile.services as string) : null,
      rates: profile.rates ? JSON.parse(profile.rates as string) : null,
      availability: profile.availability ? JSON.parse(profile.availability as string) : null,
    }

    return NextResponse.json({ profile: profileResponse }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PERFORMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        bio: body.bio,
        location: body.location,
        age: body.age ? parseInt(body.age) : null,
        height: body.height,
        measurements: body.measurements,
        services: body.services ? (JSON.stringify(body.services) as any) : null,
        rates: body.rates ? (JSON.stringify(body.rates) as any) : null,
      },
      create: {
        userId: session.user.id,
        bio: body.bio,
        location: body.location,
        age: body.age ? parseInt(body.age) : null,
        height: body.height,
        measurements: body.measurements,
        services: body.services ? (JSON.stringify(body.services) as any) : null,
        rates: body.rates ? (JSON.stringify(body.rates) as any) : null,
      },
    })

    // Parse JSON fields for response
    const profileResponse = {
      ...profile,
      services: profile.services ? JSON.parse(profile.services as string) : null,
      rates: profile.rates ? JSON.parse(profile.rates as string) : null,
      availability: profile.availability ? JSON.parse(profile.availability as string) : null,
    }

    return NextResponse.json({ profile: profileResponse }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

