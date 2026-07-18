import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  NavLink,
  useLocation,
} from 'react-router-dom'
import { getNotificationSummary } from '../../../services/notificationService'

function AdminSidebar() {
  const location = useLocation()

  const [unreadCount, setUnreadCount] =
    useState(0)

  const getLinkClass = ({ isActive }) =>
    `admin-sidebar-link ${isActive ? 'active' : ''}`

  const loadUnreadCount =
    useCallback(async () => {
      try {
        const data =
          await getNotificationSummary()

        setUnreadCount(
          data.summary?.unread || 0,
        )
      } catch {
        setUnreadCount(0)
      }
    }, [])

  useEffect(() => {
    loadUnreadCount()
  }, [
    location.pathname,
    loadUnreadCount,
  ])

  useEffect(() => {
    const intervalId = window.setInterval(
      loadUnreadCount,
      30000,
    )

    window.addEventListener(
      'notifications:updated',
      loadUnreadCount,
    )

    return () => {
      window.clearInterval(intervalId)

      window.removeEventListener(
        'notifications:updated',
        loadUnreadCount,
      )
    }
  }, [loadUnreadCount])

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span>Vida Activa</span>
        <small>Panel administrador</small>
      </div>

      <nav className="admin-sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          className={getLinkClass}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/clients"
          className={getLinkClass}
        >
          Clientes
        </NavLink>

        <NavLink
          to="/admin/notifications"
          className={({ isActive }) =>
            `${getLinkClass({
              isActive,
            })} d-flex align-items-center justify-content-between gap-2`
          }
        >
          <span>Notificaciones</span>

          {unreadCount > 0 && (
            <span className="badge rounded-pill text-bg-danger">
              {unreadCount > 99
                ? '99+'
                : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/change-password"
          className={getLinkClass}
        >
          Cambiar contraseña
        </NavLink>
      </nav>
    </aside>
  )
}

export default AdminSidebar
