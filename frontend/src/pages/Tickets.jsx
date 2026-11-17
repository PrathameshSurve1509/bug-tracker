
import { useEffect, useState } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

function Tickets() {
  const projectId = 1

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)

  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  const [comments, setComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [expandedTicket, setExpandedTicket] = useState(null)
  const [commentLoading, setCommentLoading] = useState(false)

  // Edit ticket states
  const [editingTicket, setEditingTicket] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assignedToEmail: '',
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: projectId,
    assignedToEmail: '',
  })

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get(`/tickets/project/${projectId}`)
      setTickets(response.data)
    } catch (err) {
      setError('Unable to load tickets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Search and filter tickets
  const handleSearchAndFilter = async () => {
    try {
      setLoading(true)
      setError('')

      let response

      if (searchTitle.trim()) {
        response = await api.get(
          `/tickets/project/${projectId}/search`,
          { params: { title: searchTitle.trim() } }
        )
      } else if (statusFilter !== 'ALL') {
        response = await api.get(
          `/tickets/project/${projectId}/status/${statusFilter}`
        )
      } else if (priorityFilter !== 'ALL') {
        response = await api.get(
          `/tickets/project/${projectId}/priority/${priorityFilter}`
        )
      } else {
        response = await api.get(`/tickets/project/${projectId}`)
      }

      let filteredTickets = response.data

      if (statusFilter !== 'ALL') {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.status === statusFilter
        )
      }

      if (priorityFilter !== 'ALL') {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.priority === priorityFilter
        )
      }

      setTickets(filteredTickets)
    } catch (err) {
      setError('Failed to search or filter tickets.')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = async () => {
    setSearchTitle('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    await fetchTickets()
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Create ticket
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        ...formData,
        assignedToEmail: formData.assignedToEmail.trim() || null,
      }

      await api.post('/tickets', payload)

      setMessage('Ticket created successfully!')

      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        projectId: projectId,
        assignedToEmail: '',
      })

      await fetchTickets()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create ticket.'
      )
    } finally {
      setCreating(false)
    }
  }

  // Open edit form
  const handleEditClick = (ticket) => {
    setEditingTicket(ticket.id)

    setEditForm({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'MEDIUM',
      status: ticket.status || 'TODO',
      assignedToEmail:
        typeof ticket.assignedTo === 'string'
          ? ticket.assignedTo
          : ticket.assignedTo?.email || '',
    })

    setError('')
    setMessage('')
  }

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    })
  }

  // Save edited ticket
  const handleUpdateTicket = async (e) => {
    e.preventDefault()

    try {
      setSavingEdit(true)
      setError('')
      setMessage('')

      const payload = {
        ...editForm,
        assignedToEmail: editForm.assignedToEmail.trim() || null,
      }

      await api.put(`/tickets/${editingTicket}`, payload)

      setMessage('Ticket updated successfully!')
      setEditingTicket(null)

      await fetchTickets()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update ticket.'
      )
    } finally {
      setSavingEdit(false)
    }
  }

  // Delete ticket
  const handleDeleteTicket = async (ticketId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ticket #${ticketId}? Its comments will also be deleted.`
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('')

      await api.delete(`/tickets/${ticketId}`)

      setMessage('Ticket deleted successfully!')

      if (expandedTicket === ticketId) {
        setExpandedTicket(null)
      }

      setComments((prev) => {
        const updated = { ...prev }
        delete updated[ticketId]
        return updated
      })

      await fetchTickets()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete ticket.'
      )
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-slate-100 text-slate-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'
      case 'DONE':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  // Comments
  const fetchComments = async (ticketId) => {
    try {
      const response = await api.get(`/comments/ticket/${ticketId}`)
      setComments((prev) => ({
        ...prev,
        [ticketId]: response.data,
      }))
    } catch (err) {
      setError('Unable to load comments.')
    }
  }

  const toggleComments = async (ticketId) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null)
      return
    }

    setExpandedTicket(ticketId)
    await fetchComments(ticketId)
  }

  const handleCommentChange = (ticketId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [ticketId]: value,
    }))
  }

  const handleAddComment = async (ticketId) => {
    const content = commentInputs[ticketId]?.trim()

    if (!content) return

    try {
      setCommentLoading(true)

      await api.post(`/comments/ticket/${ticketId}`, {
        content: content,
      })

      setCommentInputs((prev) => ({
        ...prev,
        [ticketId]: '',
      }))

      await fetchComments(ticketId)
    } catch (err) {
      setError('Failed to add comment.')
    } finally {
      setCommentLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Ticket Management
          </h1>
          <p className="text-slate-500 mt-2">
            Project: Bug Tracker Development
          </p>
        </div>

        {message && (
          <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {/* Create Ticket Form */}
        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-5">
            Create New Ticket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-2">
                Ticket Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter ticket title"
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue"
                rows="3"
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Assign To (Email)
              </label>
              <input
                type="email"
                name="assignedToEmail"
                value={formData.assignedToEmail}
                onChange={handleChange}
                placeholder="developer@example.com (optional)"
                className="w-full border rounded-lg p-3"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
          </form>
        </section>

        {/* Search and Filters */}
        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-5">
            Search & Filter Tickets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-2">
                Search by Title
              </label>
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Enter ticket title..."
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Filter by Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={handleSearchAndFilter}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>

            <button
              onClick={resetFilters}
              className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* Ticket List */}
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">
              Tickets ({tickets.length})
            </h2>

            <button
              onClick={fetchTickets}
              className="text-blue-600 font-medium hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-slate-500">No tickets found.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Ticket #{ticket.id}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium h-fit ${getStatusColor(ticket.status)}`}>
                      {ticket.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-600 mt-3">
                    {ticket.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-5 mt-4 text-sm text-slate-500">
                    <span>Priority: {ticket.priority}</span>
                    <span>Assigned: {ticket.assignedTo || 'Unassigned'}</span>
                    <span>Created by: {ticket.createdBy}</span>
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEditClick(ticket)}
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Edit Form */}
                  {editingTicket === ticket.id && (
                    <form
                      onSubmit={handleUpdateTicket}
                      className="mt-5 border-t pt-5 space-y-4"
                    >
                      <h3 className="font-semibold text-lg">
                        Edit Ticket #{ticket.id}
                      </h3>

                      <div>
                        <label className="block font-medium mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          required
                          maxLength="255"
                          className="w-full border rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          maxLength="2000"
                          rows="3"
                          className="w-full border rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-2">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={editForm.priority}
                          onChange={handleEditChange}
                          className="w-full border rounded-lg p-3"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={editForm.status}
                          onChange={handleEditChange}
                          className="w-full border rounded-lg p-3"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium mb-2">
                          Assigned To (Email)
                        </label>
                        <input
                          type="email"
                          name="assignedToEmail"
                          value={editForm.assignedToEmail}
                          onChange={handleEditChange}
                          placeholder="developer@example.com (optional)"
                          className="w-full border rounded-lg p-3"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={savingEdit}
                          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                        >
                          {savingEdit ? 'Saving...' : 'Save Changes'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingTicket(null)}
                          className="bg-slate-200 text-slate-700 px-5 py-3 rounded-lg hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Comments */}
                  <div className="mt-5 border-t pt-4">
                    <button
                      onClick={() => toggleComments(ticket.id)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {expandedTicket === ticket.id
                        ? 'Hide Comments'
                        : 'View Comments'}
                    </button>

                    {expandedTicket === ticket.id && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-3">
                          {comments[ticket.id]?.length > 0 ? (
                            comments[ticket.id].map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-slate-50 p-3 rounded-lg"
                              >
                                <p className="font-semibold text-slate-800">
                                  {comment.userName}
                                </p>

                                <p className="text-slate-700 mt-1">
                                  {comment.content}
                                </p>

                                <p className="text-xs text-slate-400 mt-2">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 text-sm">
                              No comments yet.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={commentInputs[ticket.id] || ''}
                            onChange={(e) =>
                              handleCommentChange(ticket.id, e.target.value)
                            }
                            placeholder="Write a comment..."
                            className="flex-1 border rounded-lg p-3"
                          />

                          <button
                            onClick={() => handleAddComment(ticket.id)}
                            disabled={commentLoading}
                            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                          >
                            {commentLoading ? 'Posting...' : 'Add Comment'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Tickets
