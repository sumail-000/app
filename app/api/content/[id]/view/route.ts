import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only clients can view content (performers can't view their own content to inflate views)
    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can view content' }, { status: 403 })
    }

    const content = await prisma.content.findUnique({
      where: { id: params.id },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Increment view count
    const updatedContent = await prisma.content.update({
      where: { id: params.id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
        likes: true,
      },
    })

    return NextResponse.json({ content: updatedContent }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to increment view' },
      { status: 500 }
    )
  }
}

