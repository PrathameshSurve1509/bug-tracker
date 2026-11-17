
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const projectId = 1

  const fetchTickets = async () => {
    try {
      setError('')
      const response = await api.get(
        `/tickets/project/${projectId}`
      )
      setTickets(response.data)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Ticket status counts
  const totalTickets = tickets.length

  const todo = tickets.filter(
    ticket => ticket.status === 'TODO'
  ).length

  const inProgress = tickets.filter(
    ticket => ticket.status === 'IN_PROGRESS'
  ).length

  const completed = tickets.filter(
    ticket => ticket.status === 'DONE'
  ).length

  // Ticket priority counts
  const critical = tickets.filter(
    ticket => ticket.priority === 'CRITICAL'
  ).length

  const high = tickets.filter(
    ticket => ticket.priority === 'HIGH'
  ).length

  const medium = tickets.filter(
    ticket => ticket.priority === 'MEDIUM'
  ).length

  const low = tickets.filter(
    ticket => ticket.priority === 'LOW'
  ).length

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome back, {user.name || 'User'}!
            </p>
          </div>

          <button
            onClick={fetchTickets}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-gray-500">
            Loading dashboard...
          </p>
        ) : error ? (
          <p className="mt-8 text-red-500">{error}</p>
        ) : (
          <>
            {/* Ticket Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Total Tickets</p>
                <h2 className="text-3xl font-bold mt-2">
                  {totalTickets}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">To Do</p>
                <h2 className="text-3xl font-bold text-gray-600 mt-2">
                  {todo}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">In Progress</p>
                <h2 className="text-3xl font-bold text-blue-600 mt-2">
                  {inProgress}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Completed</p>
                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  {completed}
                </h2>
              </div>
            </div>

            {/* Priority Summary */}
            <div className="bg-white p-6 rounded-xl shadow mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-5">
                Priority Summary
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-600 font-medium">
                    Critical
                  </p>
                  <h3 className="text-2xl font-bold text-red-700 mt-2">
                    {critical}
                  </h3>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-600 font-medium">
                    High
                  </p>
                  <h3 className="text-2xl font-bold text-orange-700 mt-2">
                    {high}
                  </h3>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-600 font-medium">
                    Medium
                  </p>
                  <h3 className="text-2xl font-bold text-yellow-700 mt-2">
                    {medium}
                  </h3>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 font-medium">
                    Low
                  </p>
                  <h3 className="text-2xl font-bold text-green-700 mt-2">
                    {low}
                  </h3>
                </div>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="bg-white p-6 rounded-xl shadow mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Tickets
                </h2>

                <Link
                  to="/tickets"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View All →
                </Link>
              </div>

              {tickets.length === 0 ? (
                <p className="text-gray-500">
                  No tickets found.
                </p>
              ) : (
                <div className="space-y-3">
                  {tickets.slice(0, 5).map(ticket => (
                    <div
                      key={ticket.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-3"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {ticket.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Ticket #{ticket.id} · {ticket.priority}
                        </p>
                      </div>

                      <span className="text-sm font-medium text-blue-600 mt-2 md:mt-0">
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard
