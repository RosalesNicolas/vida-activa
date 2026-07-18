import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  attendNotification,
  getNotifications,
  getNotificationSummary,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  reopenNotification,
} from '../../../services/notificationService'

const PAGE_SIZE = 10

const FILTERS = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'unread', label: 'No leídas' },
  { value: 'read', label: 'Leídas' },
  { value: 'attended', label: 'Atendidas' },
  { value: 'resolved', label: 'Resueltas' },
  { value: 'all', label: 'Todas' },
]

function formatDateTime(value) {
  if (!value) return ''

  return new Date(value).toLocaleString(
    'es-AR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  )
}

function getStateBadge(notification) {
  if (notification.resolvedAt) {
    return {
      label: 'Resuelta',
      className: 'text-bg-success',
    }
  }

  if (notification.attendedAt) {
    return {
      label: 'Atendida',
      className: 'text-bg-secondary',
    }
  }

  if (!notification.readAt) {
    return {
      label: 'No leída',
      className: 'text-bg-danger',
    }
  }

  return {
    label: 'Leída',
    className: 'text-bg-light',
  }
}

function SummaryCard({ title, value }) {
  return (
    <div className="col-6 col-xl-3">
      <div className="card border-0 shadow-sm p-3 h-100">
        <small className="text-secondary">
          {title}
        </small>

        <strong className="h3 mb-0 mt-1">
          {value}
        </strong>
      </div>
    </div>
  )
}

function AdminNotificationsPage() {
  const navigate = useNavigate()

  const [notifications, setNotifications] =
    useState([])

  const [summary, setSummary] = useState({
    total: 0,
    unread: 0,
    pending: 0,
    attended: 0,
    resolved: 0,
  })

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: PAGE_SIZE,
      total: 0,
      totalPages: 1,
    })

  const [status, setStatus] =
    useState('pending')

  const [page, setPage] = useState(1)
  const [loading, setLoading] =
    useState(true)

  const [error, setError] = useState('')
  const [actionId, setActionId] =
    useState(null)

  const notifySidebar = () => {
    window.dispatchEvent(
      new Event('notifications:updated'),
    )
  }

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const [
        notificationData,
        summaryData,
      ] = await Promise.all([
        getNotifications({
          page,
          limit: PAGE_SIZE,
          status,
        }),
        getNotificationSummary(),
      ])

      setNotifications(
        notificationData.notifications || [],
      )

      setPagination(
        notificationData.pagination || {
          page,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
        },
      )

      setSummary(
        summaryData.summary || {
          total: 0,
          unread: 0,
          pending: 0,
          attended: 0,
          resolved: 0,
        },
      )

      notifySidebar()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudieron cargar las notificaciones',
      )
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFilterChange = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  const handleOpenNotification = async (
    notification,
  ) => {
    if (actionId) return

    try {
      setActionId(notification.id)
      setError('')

      if (!notification.readAt) {
        await markNotificationAsRead(
          notification.id,
        )

        notifySidebar()
      }

      if (notification.actionUrl) {
        navigate(notification.actionUrl)
        return
      }

      await loadData()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo abrir la notificación',
      )
    } finally {
      setActionId(null)
    }
  }

  const handleAttend = async (
    event,
    notificationId,
  ) => {
    event.stopPropagation()

    try {
      setActionId(notificationId)
      setError('')

      await attendNotification(notificationId)
      notifySidebar()
      await loadData()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo atender la notificación',
      )
    } finally {
      setActionId(null)
    }
  }

  const handleReopen = async (
    event,
    notificationId,
  ) => {
    event.stopPropagation()

    try {
      setActionId(notificationId)
      setError('')

      await reopenNotification(notificationId)
      notifySidebar()
      await loadData()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo reabrir la notificación',
      )
    } finally {
      setActionId(null)
    }
  }

  const handleReadAll = async () => {
    try {
      setActionId('read-all')
      setError('')

      await markAllNotificationsAsRead()
      notifySidebar()
      await loadData()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudieron marcar las notificaciones como leídas',
      )
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">
            Notificaciones
          </h1>

          <p className="text-secondary mb-0">
            Avisos, acciones pendientes y alertas automáticas.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={handleReadAll}
          disabled={
            summary.unread === 0 ||
            actionId === 'read-all'
          }
        >
          {actionId === 'read-all'
            ? 'Actualizando...'
            : 'Marcar todas como leídas'}
        </button>
      </div>

      <div className="row g-3 mb-4">
        <SummaryCard
          title="No leídas"
          value={summary.unread}
        />

        <SummaryCard
          title="Pendientes"
          value={summary.pending}
        />

        <SummaryCard
          title="Atendidas"
          value={summary.attended}
        />

        <SummaryCard
          title="Resueltas"
          value={summary.resolved}
        />
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={
              status === filter.value
                ? 'btn btn-dark'
                : 'btn btn-outline-dark'
            }
            onClick={() =>
              handleFilterChange(filter.value)
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando notificaciones...</p>
      ) : notifications.length === 0 ? (
        <div className="card border-0 shadow-sm p-4">
          <p className="text-secondary mb-0">
            No hay notificaciones para este filtro.
          </p>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {notifications.map(
            (notification) => {
              const state =
                getStateBadge(notification)

              const isCondition =
                notification.category ===
                'condition'

              return (
                <div
                  key={notification.id}
                  className={`card border-0 shadow-sm p-4 ${
                    !notification.readAt &&
                    !notification.attendedAt &&
                    !notification.resolvedAt
                      ? 'border-start border-4 border-danger'
                      : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    handleOpenNotification(
                      notification,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      handleOpenNotification(
                        notification,
                      )
                    }
                  }}
                >
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <strong className="h5 mb-0">
                          {notification.title}
                        </strong>

                        <span
                          className={`badge ${state.className}`}
                        >
                          {state.label}
                        </span>

                        {isCondition && (
                          <span className="badge text-bg-warning">
                            Automática
                          </span>
                        )}
                      </div>

                      <p className="mb-2">
                        {notification.message}
                      </p>

                      <small className="text-secondary">
                        {formatDateTime(
                          notification.createdAt,
                        )}
                      </small>

                      {notification.attendedAt && (
                        <small className="text-secondary d-block mt-1">
                          Atendida el{' '}
                          {formatDateTime(
                            notification.attendedAt,
                          )}
                        </small>
                      )}

                      {notification.resolvedAt && (
                        <small className="text-secondary d-block mt-1">
                          Resuelta automáticamente el{' '}
                          {formatDateTime(
                            notification.resolvedAt,
                          )}
                        </small>
                      )}
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {notification.actionUrl && (
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                          disabled={
                            actionId ===
                            notification.id
                          }
                        >
                          Ver cliente
                        </button>
                      )}

                      {!isCondition &&
                        !notification.attendedAt &&
                        !notification.resolvedAt && (
                          <button
                            type="button"
                            className="btn btn-dark btn-sm"
                            onClick={(event) =>
                              handleAttend(
                                event,
                                notification.id,
                              )
                            }
                            disabled={
                              actionId ===
                              notification.id
                            }
                          >
                            Marcar como atendida
                          </button>
                        )}

                      {!isCondition &&
                        notification.attendedAt && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={(event) =>
                              handleReopen(
                                event,
                                notification.id,
                              )
                            }
                            disabled={
                              actionId ===
                              notification.id
                            }
                          >
                            Reabrir
                          </button>
                        )}
                    </div>
                  </div>

                  {isCondition &&
                    !notification.resolvedAt && (
                      <small className="text-secondary mt-3">
                        Esta alerta se resolverá automáticamente cuando deje de existir la condición.
                      </small>
                    )}
                </div>
              )
            },
          )}
        </div>
      )}

      {!loading && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
          <span className="text-secondary">
            Página {pagination.page} de{' '}
            {pagination.totalPages} ·{' '}
            {pagination.total} notificaciones
          </span>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              disabled={pagination.page <= 1}
            >
              Anterior
            </button>

            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    pagination.totalPages,
                    current + 1,
                  ),
                )
              }
              disabled={
                pagination.page >=
                pagination.totalPages
              }
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminNotificationsPage
