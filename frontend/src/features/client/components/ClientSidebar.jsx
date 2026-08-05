import { NavLink } from "react-router-dom"

function ClientSidebar({
  onNavigate = () => {},
}) {

  const getLinkClass = ({ isActive }) =>
    `client-sidebar-link ${isActive ? "active" : ""}`

  return (
    <aside className="client-sidebar">

      <div className="client-sidebar-brand">
        <span>Vida Activa</span>
        <small>Mi espacio</small>
      </div>

      <nav className="client-sidebar-nav">

        <NavLink
          to="/client/dashboard"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Inicio
        </NavLink>

        <NavLink
          to="/client/routine"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Mi rutina
        </NavLink>

        <NavLink
          to="/client/measurements"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Mediciones
        </NavLink>

        <NavLink
          to="/client/progress"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Seguimiento
        </NavLink>

        <NavLink
          to="/client/profile"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Mi perfil
        </NavLink>

        <NavLink
          to="/client/change-password"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Cambiar contraseña
        </NavLink>

      </nav>

    </aside>
  )
}

export default ClientSidebar