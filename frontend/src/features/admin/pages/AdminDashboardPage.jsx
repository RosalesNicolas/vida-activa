import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../../services/dashboardService'

function formatDate(value) {
  if (!value) return null

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString('es-AR')
}

function MetricCard({
  title,
  value,
  description,
}) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className="card border-0 shadow-sm p-4 h-100">
        <span className="text-secondary">
          {title}
        </span>

        <strong className="display-6 mt-2">
          {value}
        </strong>

        {description && (
          <small className="text-secondary mt-2">
            {description}
          </small>
        )}
      </div>
    </div>
  )
}

function ClientAttentionList({
  title,
  description,
  items,
  emptyMessage,
  renderDetail,
}) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="p-4 border-bottom">
        <h2 className="h5 mb-1">
          {title}
        </h2>

        <p className="text-secondary mb-0">
          {description}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="p-4 mb-0 text-secondary">
          {emptyMessage}
        </p>
      ) : (
        <div className="list-group list-group-flush">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/admin/clients/${item.id}`}
              className="list-group-item list-group-item-action p-3"
            >
              <strong className="d-block">
                {item.name}
              </strong>

              <small className="text-secondary">
                {renderDetail(item)}
              </small>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminDashboardPage() {
  const [dashboard, setDashboard] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminDashboard()

      setDashboard(data)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo cargar el dashboard',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return <p>Cargando información...</p>
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="alert alert-warning">
        No hay información disponible.
      </div>
    )
  }

  const {
    metrics,
    attention,
    recent,
    settings,
  } = dashboard

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold">
            Dashboard
          </h1>

          <p className="text-secondary mb-0">
            Resumen general y tareas que
            requieren atención.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={loadDashboard}
          >
            Actualizar
          </button>

          <Link
            to="/admin/clients/new"
            className="btn btn-dark"
          >
            Nuevo cliente
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <MetricCard
          title="Clientes activos"
          value={metrics.activeClients}
          description={`${metrics.totalClients} clientes totales`}
        />

        <MetricCard
          title="Rutinas activas"
          value={metrics.activeRoutines}
          description="Clientes activos con rutina"
        />

        <MetricCard
          title="Sin rutina activa"
          value={metrics.clientsWithoutRoutine}
          description="Clientes que necesitan planificación"
        />

        <MetricCard
          title={`Sin medición en ${settings.recentMeasurementDays} días`}
          value={
            metrics.clientsWithoutRecentMeasurement
          }
          description="Incluye clientes sin mediciones"
        />

        <MetricCard
          title="Seguimientos en proceso"
          value={metrics.progressInProcess}
          description="Requieren revisión o continuidad"
        />

        <MetricCard
          title="Respuestas de clientes"
          value={metrics.clientResponses}
          description="Seguimientos con respuesta"
        />

        <MetricCard
          title="Clientes inactivos"
          value={metrics.inactiveClients}
          description="Cuentas actualmente desactivadas"
        />

        <MetricCard
          title="Total de clientes"
          value={metrics.totalClients}
          description="Todos los perfiles registrados"
        />
      </div>

      <h2 className="h4 mb-3">
        Requieren atención
      </h2>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <ClientAttentionList
            title="Sin rutina activa"
            description="Clientes activos sin una rutina vigente."
            items={
              attention.clientsWithoutRoutine
            }
            emptyMessage="Todos los clientes activos tienen una rutina."
            renderDetail={(item) =>
              item.email || 'Sin email'
            }
          />
        </div>

        <div className="col-lg-4">
          <ClientAttentionList
            title="Sin mediciones recientes"
            description={`Sin registros durante los últimos ${settings.recentMeasurementDays} días.`}
            items={
              attention.clientsWithoutRecentMeasurement
            }
            emptyMessage="Todos los clientes tienen mediciones recientes."
            renderDetail={(item) =>
              item.lastMeasurementDate
                ? `Última medición: ${formatDate(
                    item.lastMeasurementDate,
                  )}`
                : 'Nunca registró una medición'
            }
          />
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="p-4 border-bottom">
              <h2 className="h5 mb-1">
                Seguimientos en proceso
              </h2>

              <p className="text-secondary mb-0">
                Indicaciones que todavía no
                están finalizadas.
              </p>
            </div>

            {attention.progressInProcess
              .length === 0 ? (
              <p className="p-4 mb-0 text-secondary">
                No hay seguimientos en proceso.
              </p>
            ) : (
              <div className="list-group list-group-flush">
                {attention.progressInProcess.map(
                  (progress) => (
                    <Link
                      key={progress.id}
                      to={`/admin/clients/${progress.clientId}`}
                      className="list-group-item list-group-item-action p-3"
                    >
                      <strong className="d-block">
                        {progress.clientName}
                      </strong>

                      <span className="d-block">
                        {progress.title}
                      </span>

                      <small className="text-secondary">
                        {formatDate(progress.date)}
                      </small>
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="p-4 border-bottom">
              <h2 className="h5 mb-1">
                Respuestas recientes
              </h2>

              <p className="text-secondary mb-0">
                Comentarios enviados por los
                clientes en sus seguimientos.
              </p>
            </div>

            {recent.clientResponses.length ===
            0 ? (
              <p className="p-4 mb-0 text-secondary">
                Todavía no hay respuestas de
                clientes.
              </p>
            ) : (
              <div className="list-group list-group-flush">
                {recent.clientResponses.map(
                  (response) => (
                    <Link
                      key={response.id}
                      to={`/admin/clients/${response.clientId}`}
                      className="list-group-item list-group-item-action p-3"
                    >
                      <div className="d-flex justify-content-between gap-3">
                        <strong>
                          {response.clientName}
                        </strong>

                        <small className="text-secondary">
                          {formatDate(response.date)}
                        </small>
                      </div>

                      <span className="d-block mt-1">
                        {response.title}
                      </span>

                      <p className="text-secondary mb-0 mt-2">
                        {response.clientComment}
                      </p>
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <ClientAttentionList
            title="Últimos clientes"
            description="Perfiles incorporados recientemente."
            items={recent.latestClients}
            emptyMessage="Todavía no hay clientes registrados."
            renderDetail={(item) =>
              item.email || 'Sin email'
            }
          />
        </div>
      </div>
    </>
  )
}

export default AdminDashboardPage
