import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'

export default async function ProfilesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const profiles = await prisma.profile.findMany({
    where: {
      user: {
        role: 'PERFORMER',
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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
      _count: {
        select: {
          favorites: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="container mx-auto px-4 py-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Browse Performers</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {profiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No performers found yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => {
              const rates = profile.rates ? (typeof profile.rates === 'string' ? JSON.parse(profile.rates) : profile.rates) : {}
              const services = profile.services ? (typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services) : []
              
              return (
                <Link
                  key={profile.id}
                  href={`/profiles/${profile.userId}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition group"
                >
                  <div className="relative aspect-[4/5] bg-gray-900">
                    {profile.content[0]?.thumbnail || profile.content[0]?.url ? (
                      <SafeImage
                        src={profile.content[0].thumbnail || profile.content[0].url}
                        alt={profile.user.name || 'Performer'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        fallbackSrc={profile.content[0]?.url}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {profile.featured && (
                      <div className="absolute top-2 right-2 bg-primary px-2 py-1 rounded text-xs font-semibold">
                        Featured
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
                    {profile.age && (
                      <p className="text-gray-400 text-sm mb-3">Age: {profile.age}</p>
                    )}
                    
                    {profile.bio && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{profile.bio}</p>
                    )}

                    {services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {services.slice(0, 2).map((service) => (
                          <span
                            key={service}
                            className="text-xs bg-gray-700 px-2 py-1 rounded"
                          >
                            {service}
                          </span>
                        ))}
                        {services.length > 2 && (
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            +{services.length - 2}
                          </span>
                        )}
                      </div>
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

