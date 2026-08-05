import { useState } from 'react'
import {
  Outlet,
  useNavigate,
} from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import AdminSidebar from '../components/AdminSidebar'

function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [menuOpen, setMenuOpen] =
    useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  return (
    <div className="admin-layout">
      <div
        className={`admin-sidebar-wrapper ${
          menuOpen ? 'is-open' : ''
        }`}
      >
        <AdminSidebar
          onNavigate={handleCloseMenu}
        />
      </div>

      {menuOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={handleCloseMenu}
        />
      )}

      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-identity">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm admin-menu-button"
              onClick={() =>
                setMenuOpen((current) => !current)
              }
              aria-expanded={menuOpen}
              aria-label="Abrir menú de administración"
            >
              Menú
            </button>

            <div>
              <strong>{user.name}</strong>
              <span>Administrador</span>
            </div>
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