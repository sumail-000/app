import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contentSchema = z.object({
  profileId: z.string(),
  type: z.enum(['photo']).default('photo'),
  url: z.string().url().refine((url) => {
    // Allow any valid URL - client-side extraction handles Google Images URLs
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }, { message: 'Invalid URL format' }),
  thumbnail: z.string().url().optional().nullable().or(z.literal('')),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isPremium: z.boolean().default(false),
  price: z.number().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PERFORMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = contentSchema.parse(body)

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: validated.profileId },
    })

    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const content = await prisma.content.create({
      data: {
        userId: session.user.id,
        profileId: validated.profileId,
        type: validated.type,
        url: validated.url,
        thumbnail: validated.thumbnail || null,
        title: validated.title || null,
        description: validated.description || null,
        isPremium: validated.isPremium,
        price: validated.price || null,
      },
    })

    return NextResponse.json({ content }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create content' },
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
    const profileId = searchParams.get('profileId')

    if (session.user.role === 'PERFORMER') {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      })

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      const content = await prisma.content.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ content }, { status: 200 })
    }

    if (profileId) {
      const content = await prisma.content.findMany({
        where: {
          profileId,
          isPremium: false,
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ content }, { status: 200 })
    }

    return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

