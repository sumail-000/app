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

    // Only clients can like content
    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can like content' }, { status: 403 })
    }

    const content = await prisma.content.findUnique({
      where: { id: params.id },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Check if user already liked this content (using a simple approach)
    // We'll store liked content IDs in a JSON field or create a separate table
    // For now, we'll use a simple increment (can be improved with ContentLike model later)
    
    // Increment like count
    const updatedContent = await prisma.content.update({
      where: { id: params.id },
      data: {
        likes: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
        likes: true,
      },
    })

    return NextResponse.json({ 
      content: updatedContent,
      liked: true 
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to like content' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can unlike content' }, { status: 403 })
    }

    const content = await prisma.content.findUnique({
      where: { id: params.id },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Decrement like count (prevent negative)
    const updatedContent = await prisma.content.update({
      where: { id: params.id },
      data: {
        likes: {
          decrement: 1,
        },
      },
      select: {
        id: true,
        views: true,
        likes: true,
      },
    })

    // Ensure likes don't go negative
    if (updatedContent.likes < 0) {
      await prisma.content.update({
        where: { id: params.id },
        data: { likes: 0 },
      })
      updatedContent.likes = 0
    }

    return NextResponse.json({ 
      content: updatedContent,
      liked: false 
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to unlike content' },
      { status: 500 }
    )
  }
}

