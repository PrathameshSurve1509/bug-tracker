
import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

function Kanban() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingTicketId, setUpdatingTicketId] = useState(null)
  const [draggedTicketId, setDraggedTicketId] = useState(null)

  const projectId = 1

  const fetchTickets = async () => {
    try {
      setError('')
      const response = await api.get(
        `/tickets/project/${projectId}`
      )
      setTickets(response.data)
    } catch (err) {
      console.error('Kanban error:', err)
      setError('Unable to load tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Update ticket status in backend
  const updateStatus = async (ticketId, newStatus) => {
    try {
      setUpdatingTicketId(ticketId)
      setError('')

      await api.patch(
        `/tickets/${ticketId}/status`,
        { status: newStatus }
      )

      setTickets(previousTickets =>
        previousTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, status: newStatus }
            : ticket
        )
      )
    } catch (err) {
      console.error('Status update error:', err)
      setError('Failed to update ticket status.')
    } finally {
      setUpdatingTicketId(null)
      setDraggedTicketId(null)
    }
  }

  // Drag starts
  const handleDragStart = (ticketId) => {
    setDraggedTicketId(ticketId)
  }

  // Allow dropping into a column
  const handleDragOver = (event) => {
    event.preventDefault()
  }

  // Drop ticket into another column
  const handleDrop = (event, newStatus) => {
    event.preventDefault()

    if (draggedTicketId === null) return

    const ticket = tickets.find(
      item => item.id === draggedTicketId
    )

    if (!ticket || ticket.status === newStatus) {
      setDraggedTicketId(null)
      return
    }

    updateStatus(draggedTicketId, newStatus)
  }

  const columns = [
    {
      title: 'To Do',
      status: 'TODO',
      color: 'border-gray-400',
      headingColor: 'text-gray-700'
    },
    {
      title: 'In Progress',
      status: 'IN_PROGRESS',
      color: 'border-blue-500',
      headingColor: 'text-blue-600'
    },
    {
      title: 'Done',
      status: 'DONE',
      color: 'border-green-500',
      headingColor: 'text-green-600'
    }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700'
      case 'LOW':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getNextStatus = (status) => {
    if (status === 'TODO') return 'IN_PROGRESS'
    if (status === 'IN_PROGRESS') return 'DONE'
    return 'TODO'
  }

  const getButtonText = (status) => {
    if (status === 'TODO') return 'Start Progress →'
    if (status === 'IN_PROGRESS') return 'Mark as Done →'
    return 'Reopen Ticket ↻'
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Kanban Board
            </h1>
            <p className="text-gray-500 mt-2">
              Drag tickets between columns to update their status.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <p className="mt-5 text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-gray-500">
            Loading tickets...
          </p>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {columns.map(column => (
                <div
                  key={column.status}
                  className="bg-white p-4 rounded-xl shadow-sm"
                >
                  <p className="text-sm text-gray-500">
                    {column.title}
                  </p>
                  <h2 className="text-2xl font-bold mt-1">
                    {
                      tickets.filter(
                        ticket => ticket.status === column.status
                      ).length
                    }
                  </h2>
                </div>
              ))}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

              {columns.map(column => {
                const columnTickets = tickets.filter(
                  ticket => ticket.status === column.status
                )

                return (
                  <div
                    key={column.status}
                    onDragOver={handleDragOver}
                    onDrop={(event) =>
                      handleDrop(event, column.status)
                    }
                    className={`bg-gray-200 rounded-xl p-4 min-h-96 transition ${
                      draggedTicketId !== null
                        ? 'border-2 border-dashed border-blue-400'
                        : ''
                    }`}
                  >
                    {/* Column Header */}
                    <div
                      className={`flex justify-between items-center border-b-2 ${column.color} pb-3 mb-4`}
                    >
                      <h2 className={`font-bold text-lg ${column.headingColor}`}>
                        {column.title}
                      </h2>
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold">
                        {columnTickets.length}
                      </span>
                    </div>

                    {/* Tickets */}
                    <div className="space-y-4">
                      {columnTickets.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">
                          Drop tickets here
                        </p>
                      ) : (
                        columnTickets.map(ticket => (
                          <div
                            key={ticket.id}
                            draggable={updatingTicketId !== ticket.id}
                            onDragStart={() =>
                              handleDragStart(ticket.id)
                            }
                            onDragEnd={() =>
                              setDraggedTicketId(null)
                            }
                            className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing transition ${
                              draggedTicketId === ticket.id
                                ? 'opacity-40'
                                : 'hover:shadow-md'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-semibold text-gray-800">
                                {ticket.title}
                              </h3>
                              <span className="text-xs text-gray-400">
                                #{ticket.id}
                              </span>
                            </div>

                            <p className="text-sm text-gray-500 mt-3">
                              Priority
                            </p>

                            <span
                              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}
                            >
                              {ticket.priority}
                            </span>

                            <div className="border-t border-gray-100 mt-4 pt-4">
                              <button
                                onClick={() =>
                                  updateStatus(
                                    ticket.id,
                                    getNextStatus(ticket.status)
                                  )
                                }
                                disabled={updatingTicketId === ticket.id}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
                              >
                                {updatingTicketId === ticket.id
                                  ? 'Updating...'
                                  : getButtonText(ticket.status)}
                              </button>
                            </div>

                            <p className="text-xs text-gray-400 text-center mt-3">
                              ↕ Drag card to another column
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}

            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Kanban
