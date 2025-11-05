import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FavoriteButton from '@/components/FavoriteButton'
import BookingButton from '@/components/BookingButton'
import ContentGrid from '@/components/ContentGrid'
import SafeImage from '@/components/SafeImage'

export default async function ProfileDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
      content: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  })

  if (!profile || profile.user.role !== 'PERFORMER') {
    redirect('/profiles')
  }

  const isFavorited = session.user.role === 'CLIENT' ? await prisma.favorite.findUnique({
    where: {
      userId_profileId: {
        userId: session.user.id,
        profileId: profile.id,
      },
    },
  }) : null

  const rates = profile.rates ? (typeof profile.rates === 'string' ? JSON.parse(profile.rates) : profile.rates) : {}
  const services = profile.services ? (typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services) : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="container mx-auto px-4 py-6 border-b border-gray-800">
        <Link href="/profiles" className="text-primary hover:underline">← Back to Browse</Link>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden">
              {profile.content[0]?.url ? (
                <SafeImage
                  src={profile.content[0].thumbnail || profile.content[0].url}
                  alt={profile.user.name || 'Performer'}
                  className="w-full h-full object-cover"
                  fallbackSrc={profile.content[0].url}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            {profile.content.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {profile.content.slice(1, 5).map((item) => (
                  <div key={item.id} className="relative aspect-square bg-gray-900 rounded overflow-hidden">
                    {item.thumbnail || item.url ? (
                      <SafeImage
                        src={item.thumbnail || item.url}
                        alt={item.title || 'Content'}
                        className="w-full h-full object-cover"
                        fallbackSrc={item.url}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{profile.user.name || 'Anonymous'}</h1>
                  {profile.verified && (
                    <span className="bg-green-500 px-2 py-1 rounded text-sm font-semibold">
                      ✓ Verified
                    </span>
                  )}
                  {profile.featured && (
                    <span className="bg-primary px-2 py-1 rounded text-sm font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                {profile.location && (
                  <p className="text-gray-400 text-lg mb-4">📍 {profile.location}</p>
                )}
              </div>
              {session.user.role === 'CLIENT' && (
                <FavoriteButton
                  profileId={profile.id}
                  isFavorited={!!isFavorited}
                />
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              {profile.bio ? (
                <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-gray-500">No bio available.</p>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {profile.age && (
                  <div>
                    <span className="text-gray-400">Age:</span>
                    <span className="ml-2 text-white">{profile.age}</span>
                  </div>
                )}
                {profile.height && (
                  <div>
                    <span className="text-gray-400">Height:</span>
                    <span className="ml-2 text-white">{profile.height}</span>
                  </div>
                )}
                {profile.measurements && (
                  <div>
                    <span className="text-gray-400">Measurements:</span>
                    <span className="ml-2 text-white">{profile.measurements}</span>
                  </div>
                )}
              </div>
            </div>

            {services.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Services</h2>
                <div className="space-y-3">
                  {services.map((service) => {
                    const rateKey = service.toLowerCase().replace(/\s+/g, '')
                    const rate = rates[rateKey] || rates[service]
                    return (
                      <div key={service} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{service}</span>
                        {rate && (
                          <span className="text-primary font-semibold">${rate}/hr</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {session.user.role === 'CLIENT' && (
              <BookingButton performerId={profile.userId} profile={profile} />
            )}
          </div>
        </div>

        {profile.content.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Content</h2>
            <ContentGrid content={profile.content} />
          </div>
        )}
      </div>
    </div>
  )
}

