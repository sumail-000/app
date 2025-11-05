import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bookingSchema = z.object({
  performerId: z.string(),
  type: z.string(),
  date: z.string(),
  duration: z.number().min(15),
  rate: z.number(),
  notes: z.string().optional(),
  location: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = bookingSchema.parse(body)

    const booking = await prisma.booking.create({
      data: {
        performerId: validated.performerId,
        clientId: session.user.id,
        type: validated.type,
        date: new Date(validated.date),
        duration: validated.duration,
        rate: validated.rate,
        notes: validated.notes,
        location: validated.location,
        status: 'pending',
      },
      include: {
        performer: {
          select: {
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = session.user.role

    const bookings = await prisma.booking.findMany({
      where: role === 'PERFORMER'
        ? { performerId: session.user.id }
        : { clientId: session.user.id },
      include: {
        performer: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                location: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        payment: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

