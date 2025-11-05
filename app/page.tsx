import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import SafeImage from '@/components/SafeImage'

export default async function Home() {
  let session = null
  let featuredPerformers: any[] = []
  let totalPerformers = 0
  let totalBookings = 0

  try {
    session = await getServerSession(authOptions)

    // Fetch featured performers for showcase
    try {
      featuredPerformers = await prisma.profile.findMany({
        where: {
          featured: true,
          verified: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          content: {
            where: { isPremium: false },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        take: 6,
      })
    } catch (error) {
      console.error('Error fetching featured performers:', error)
      featuredPerformers = []
    }

    // Get stats
    try {
      totalPerformers = await prisma.profile.count({
        where: { verified: true },
      })
    } catch (error) {
      console.error('Error fetching total performers:', error)
      totalPerformers = 0
    }

    try {
      totalBookings = await prisma.booking.count({
        where: { status: 'completed' },
      })
    } catch (error) {
      console.error('Error fetching total bookings:', error)
      totalBookings = 0
    }
  } catch (error) {
    console.error('Error in Home component:', error)
    // Continue rendering with empty data
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
              Connect with Premium Performers
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Book private shows, connect virtually, and explore exclusive content from verified performers worldwide
            </p>
            {!session ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/register?type=performer" 
                  className="px-8 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-lg font-semibold hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/50 hover:scale-105"
                >
                  Join as Performer
                </Link>
                <Link 
                  href="/register?type=client" 
                  className="px-8 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-700 hover:border-gray-600 transition-all"
                >
                  Join as Client
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {session.user.role === 'CLIENT' ? (
                  <Link 
                    href="/profiles" 
                    className="px-8 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-lg font-semibold hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/50 hover:scale-105"
                  >
                    Browse Performers
                  </Link>
                ) : (
                  <Link 
                    href="/dashboard" 
                    className="px-8 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-lg font-semibold hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/50 hover:scale-105"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{totalPerformers}+</div>
              <div className="text-gray-400">Verified Performers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">{totalBookings}+</div>
              <div className="text-gray-400">Completed Sessions</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">100%</div>
              <div className="text-gray-400">Secure & Private</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Why Choose Us</h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need for a premium experience
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-primary/50 transition-all hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Verified Performers</h3>
              <p className="text-gray-300 leading-relaxed">
                All performers are verified and background-checked for your safety and peace of mind
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-primary/50 transition-all hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Private Shows</h3>
              <p className="text-gray-300 leading-relaxed">
                Book one-on-one sessions with your favorite performers. Secure, private, and discreet
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-primary/50 transition-all hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Virtual Connections</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect online with video calls and live streaming from anywhere in the world
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-primary/50 transition-all hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Exclusive Content</h3>
              <p className="text-gray-300 leading-relaxed">
                Access premium photos and videos from your favorite performers, available nowhere else
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-primary/50 transition-all hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure Payments</h3>
              <p className="text-gray-300 leading-relaxed">
                All transactions are encrypted and secure. Your financial information is always protected
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-primary/50 transition-all hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Direct Messaging</h3>
              <p className="text-gray-300 leading-relaxed">
                Chat directly with performers to discuss bookings, preferences, and build connections
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Performers */}
      {featuredPerformers.length > 0 && (
        <section className="py-24 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Featured Performers</h2>
            <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
              Meet our verified and featured performers
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPerformers.map((profile) => (
                <Link
                  key={profile.userId}
                  href={`/profiles/${profile.userId}`}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-primary/50 transition-all hover:scale-105 group"
                >
                  <div className="relative aspect-[4/5] bg-gray-900">
                    {profile.content[0]?.thumbnail || profile.content[0]?.url ? (
                      <SafeImage
                        src={profile.content[0].thumbnail || profile.content[0].url}
                        alt={profile.user.name || 'Performer'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {profile.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                    {profile.featured && (
                      <div className="absolute top-3 left-3 bg-primary px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{profile.user.name || 'Anonymous'}</h3>
                    {profile.location && (
                      <p className="text-gray-400 text-sm mb-3">📍 {profile.location}</p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">{profile.bio}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{profile._count.favorites} favorites</span>
                      <span className="text-primary font-semibold">View Profile →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {!session && (
              <div className="text-center mt-12">
                <Link
                  href="/profiles"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-lg font-semibold hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-primary/50"
                >
                  Browse All Performers
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Create Account</h3>
              <p className="text-gray-300">
                Sign up as a performer or client. Verification takes just a few minutes
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Browse & Connect</h3>
              <p className="text-gray-300">
                Explore profiles, chat with performers, and book your preferred session
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Enjoy Experience</h3>
              <p className="text-gray-300">
                Connect, enjoy exclusive content, and build lasting connections
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="py-24 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of performers and clients already using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?type=performer"
                className="px-8 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-lg font-semibold hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/50 hover:scale-105"
              >
                Join as Performer
              </Link>
              <Link
                href="/register?type=client"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Join as Client
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Stripping App</h3>
              <p className="text-gray-400 text-sm">
                Connecting performers and clients worldwide
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Performers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/register?type=performer" className="hover:text-primary">Join Now</Link></li>
                <li><Link href="/dashboard/profile" className="hover:text-primary">Create Profile</Link></li>
                <li><Link href="/dashboard/content" className="hover:text-primary">Upload Content</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/register?type=client" className="hover:text-primary">Sign Up</Link></li>
                <li><Link href="/profiles" className="hover:text-primary">Browse Performers</Link></li>
                <li><Link href="/dashboard/bookings" className="hover:text-primary">My Bookings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/signin" className="hover:text-primary">Sign In</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Stripping App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
