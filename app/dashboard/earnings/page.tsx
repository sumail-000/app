import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import EarningsChart from '@/components/EarningsChart'

export default async function EarningsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'PERFORMER') {
    redirect('/dashboard')
  }

  const payments = await prisma.payment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      booking: {
        include: {
          client: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const totalEarnings = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingEarnings = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  const thisMonthEarnings = payments
    .filter((p) => {
      if (p.status !== 'completed') return false
      const paymentDate = new Date(p.createdAt)
      const now = new Date()
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const thisWeekEarnings = payments
    .filter((p) => {
      if (p.status !== 'completed') return false
      const paymentDate = new Date(p.createdAt)
      const weekAgo = subDays(new Date(), 7)
      return paymentDate >= weekAgo
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const completedPayments = payments.filter((p) => p.status === 'completed').length
  const cancelledPayments = payments.filter((p) => p.status === 'cancelled').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="container mx-auto px-4 py-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Earnings</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-gray-400 text-sm mb-2">Total Earnings</h2>
            <p className="text-3xl font-bold text-green-400">${totalEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-gray-400 text-sm mb-2">This Month</h2>
            <p className="text-3xl font-bold text-blue-400">${thisMonthEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-gray-400 text-sm mb-2">This Week</h2>
            <p className="text-3xl font-bold text-purple-400">${thisWeekEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-gray-400 text-sm mb-2">Pending</h2>
            <p className="text-3xl font-bold text-yellow-400">${pendingEarnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-gray-400 text-sm mb-2">Total Transactions</h2>
            <p className="text-3xl font-bold">{payments.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-gray-400 text-sm mb-2">Completed</h2>
            <p className="text-3xl font-bold text-green-400">{completedPayments}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-gray-400 text-sm mb-2">Cancelled</h2>
            <p className="text-3xl font-bold text-red-400">{cancelledPayments}</p>
          </div>
        </div>

        {payments.filter(p => p.status === 'completed').length > 0 && (
          <div className="mb-8">
            <EarningsChart payments={payments.map(p => ({
              id: p.id,
              amount: p.amount,
              status: p.status,
              createdAt: p.createdAt
            }))} />
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Payment History</h2>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No payments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {payment.booking?.client.name || 'Client'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(payment.createdAt), 'PPP')}
                    </p>
                    {payment.description && (
                      <p className="text-sm text-gray-300 mt-1">{payment.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${payment.amount.toFixed(2)}</p>
                    <span
                      className={`text-sm ${
                        payment.status === 'completed'
                          ? 'text-green-400'
                          : payment.status === 'pending'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

