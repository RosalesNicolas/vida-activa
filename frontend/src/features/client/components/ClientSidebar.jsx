import { NavLink } from 'react-router-dom'

function ClientSidebar() {
  const getLinkClass = ({ isActive }) =>
    `client-sidebar-link ${isActive ? 'active' : ''}`

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
        >
          Inicio
        </NavLink>

        <NavLink
          to="/client/routine"
          className={getLinkClass}
        >
          Mi rutina
        </NavLink>

        <NavLink
          to="/client/measurements"
          className={getLinkClass}
        >
          Mediciones
        </NavLink>

        <NavLink
          to="/client/progress"
          className={getLinkClass}
        >
          Seguimiento
        </NavLink>

        <NavLink
          to="/client/profile"
          className={getLinkClass}
        >
          Mi perfil
        </NavLink>

        <NavLink
          to="/client/change-password"
          className={getLinkClass}
        >
          Cambiar contraseña
        </NavLink>
      </nav>
    </aside>
  )
}

export default ClientSidebar
