
import { NavLink, useNavigate } from 'react-router-dom'

function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const linkStyle = ({ isActive }) =>
    `block rounded-lg px-4 py-3 mb-2 transition ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700'
    }`

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">
        Bug<span className="text-blue-400">Tracker</span>
      </h1>

      <p className="text-xs uppercase text-gray-500 mb-4">
        Main Menu
      </p>
        
      <nav>
        <NavLink to="/dashboard" className={linkStyle}>
          🏠 Dashboard
        </NavLink>

        <NavLink to="/tickets" className={linkStyle}>
          🎫 Tickets
        </NavLink>

              <NavLink to="/kanban" className={linkStyle}>
  📋 Kanban Board
</NavLink>
      </nav>



      <div className="mt-10 border-t border-gray-700 pt-5">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-gray-700"
        >
          ↪ Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
