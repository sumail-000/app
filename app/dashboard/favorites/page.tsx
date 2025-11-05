import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'CLIENT') {
    redirect('/dashboard')
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      profile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          content: {
            where: {
              type: 'photo',
              isPremium: false,
            },
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="container mx-auto px-4 py-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Favorites</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-4">No favorites yet.</p>
            <Link
              href="/profiles"
              className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/80 inline-block"
            >
              Browse Performers
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const profile = favorite.profile
              const rates = profile.rates ? (typeof profile.rates === 'string' ? JSON.parse(profile.rates) : profile.rates) : {}
              
              return (
                <Link
                  key={favorite.id}
                  href={`/profiles/${profile.userId}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition group"
                >
                  <div className="relative aspect-[4/5] bg-gray-900">
                    {profile.content[0]?.thumbnail || profile.content[0]?.url ? (
                      <SafeImage
                        src={profile.content[0].thumbnail || profile.content[0].url}
                        alt={profile.user.name || 'Performer'}
                        className="object-cover group-hover:scale-105 transition-transform"
                        fallbackSrc={profile.content[0]?.url}
                        fill
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {profile.verified && (
                      <div className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Verified
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-1">
                      {profile.user.name || 'Anonymous'}
                    </h3>
                    {profile.location && (
                      <p className="text-gray-400 text-sm mb-2">📍 {profile.location}</p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{profile.bio}</p>
                    )}
                    {Object.keys(rates).length > 0 && (
                      <div className="text-primary font-semibold text-sm">
                        Starting at ${Math.min(...Object.values(rates).filter((v: any) => v) as number[])}/hr
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

