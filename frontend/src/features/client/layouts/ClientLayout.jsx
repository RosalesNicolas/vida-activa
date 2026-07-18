import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import ClientSidebar from '../components/ClientSidebar'

function ClientLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="client-layout">
      <ClientSidebar />

      <div className="client-content">
        <header className="client-header">
          <div>
            <strong>{user?.name || 'Cliente'}</strong>
            <span>Cliente</span>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </header>

        <main className="client-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ClientLayout

