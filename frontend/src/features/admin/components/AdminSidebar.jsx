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
import { downloadDatabaseBackup } from '../../../services/backupService'

function AdminSidebar({
  onNavigate = () => {},
}) {
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
  let isCancelled = false

  getNotificationSummary()
    .then((data) => {
      if (!isCancelled) {
        setUnreadCount(
          data.summary?.unread || 0,
        )
      }
    })
    .catch(() => {
      if (!isCancelled) {
        setUnreadCount(0)
      }
    })

  return () => {
    isCancelled = true
  }
}, [location.pathname])

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

  const handleDownloadBackup = async () => {
    const confirmed = window.confirm(
      '¿Querés descargar una copia de seguridad de la base de datos?',
    )

    if (!confirmed) return

    try {
      await downloadDatabaseBackup()
    } catch (error) {
      window.alert(
        error.response?.data?.message ??
          'No se pudo descargar la copia de seguridad.',
      )
    }
  }
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
          onClick={onNavigate}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/clients"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Clientes
        </NavLink>

        <NavLink
          to="/admin/progress/bulk"
          className={getLinkClass}
          onClick={onNavigate}
        >
          Seguimiento múltiple
        </NavLink>
        <NavLink
          to="/admin/notifications"
          className={({ isActive }) =>
            `${getLinkClass({
              isActive,
            })} d-flex align-items-center justify-content-between gap-2`
          }
          onClick={onNavigate}
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
          onClick={onNavigate}
        >
          Cambiar contraseña
        </NavLink>
        <button
          type="button"
          className="admin-sidebar-link"
          onClick={async () => {
            onNavigate()
            await handleDownloadBackup()
          }}
        >
          Descargar respaldo
        </button>
      </nav>
    </aside>
  )
}

export default AdminSidebar
