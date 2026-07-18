import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import AdminSidebar from '../components/AdminSidebar'

function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <header className="admin-header">
          <div>
            <strong>{user.name}</strong>
            <span>Administrador</span>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

