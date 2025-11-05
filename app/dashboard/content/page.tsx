import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ContentManager from '@/components/ContentManager'

export default async function ContentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'PERFORMER') {
    redirect('/dashboard')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          content: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  })

  if (!user?.profile) {
    redirect('/dashboard/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="container mx-auto px-4 py-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Content</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <ContentManager profileId={user.profile.id} content={user.profile.content} />
      </div>
    </div>
  )
}

