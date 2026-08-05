import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/useAuth"
import { useResponsiveSidebar } from "../../shared/hooks/useResponsiveSidebar"
import ClientSidebar from "../components/ClientSidebar"

function ClientLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const {
    menuOpen,
    closeMenu,
    toggleMenu,
  } = useResponsiveSidebar()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="client-layout">

      <div
        className={`client-sidebar-wrapper ${
          menuOpen ? "is-open" : ""
        }`}
      >
        <ClientSidebar
          onNavigate={closeMenu}
        />
      </div>

      {menuOpen && (
        <button
          type="button"
          className="client-sidebar-backdrop"
          onClick={closeMenu}
          aria-label="Cerrar menú"
        />
      )}

      <div className="client-content">

        <header className="client-header">

          <div className="client-header-identity">

            <button
              type="button"
              className="btn btn-dark client-menu-button"
              onClick={toggleMenu}
            >
              ☰
            </button>

            <div>
              <strong>{user?.name || "Cliente"}</strong>
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

        <main className="client-main">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default ClientLayout