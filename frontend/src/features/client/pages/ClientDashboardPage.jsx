import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientDashboard } from '../../../services/dashboardService'

function formatDate(value) {
  if (!value) return 'Sin definir'

  const normalizedValue =
    value.includes('T')
      ? value
      : `${value}T00:00:00`

  return new Date(
    normalizedValue,
  ).toLocaleDateString('es-AR')
}

function formatStatus(status) {
  const labels = {
    en_proceso: 'En proceso',
    cumplido: 'Cumplido',
    pendiente: 'Pendiente',
    completado: 'Completado',
  }

  return labels[status] || status || 'Sin definir'
}

function formatChange(value, unit) {
  if (
    value === null ||
    value === undefined
  ) {
    return 'Sin comparación'
  }

  const prefix = value > 0 ? '+' : ''

  return `${prefix}${value} ${unit}`
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

        <strong className="h3 mt-2 mb-1">
          {value}
        </strong>

        <small className="text-secondary">
          {description}
        </small>
      </div>
    </div>
  )
}

function ClientDashboardPage() {
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

      const data = await getClientDashboard()

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
    client,
    routine,
    measurements,
    progress,
  } = dashboard

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold">
            Hola, {client.name}
          </h1>

          <p className="text-secondary mb-0">
            Este es el resumen de tu progreso
            en Vida Activa.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={loadDashboard}
        >
          Actualizar
        </button>
      </div>

      {!client.requiredProfileComplete && (
        <div className="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-3">
          <span>
            Completá los datos obligatorios de
            tu perfil.
          </span>

          <Link
            to="/client/profile"
            className="btn btn-sm btn-dark"
          >
            Completar perfil
          </Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <MetricCard
          title="Rutina activa"
          value={
            routine
              ? routine.title
              : 'Sin rutina'
          }
          description={
            routine
              ? `Versión ${routine.version}`
              : 'Felipe todavía no asignó una rutina'
          }
        />

        <MetricCard
          title="Último peso"
          value={
            measurements.latest?.weight !==
              null &&
            measurements.latest?.weight !==
              undefined
              ? `${measurements.latest.weight} kg`
              : 'Sin datos'
          }
          description={
            measurements.latest
              ? formatDate(
                  measurements.latest.date,
                )
              : 'Registrá tu primera medición'
          }
        />

        <MetricCard
          title="Cambio de peso"
          value={formatChange(
            measurements.weightChange,
            'kg',
          )}
          description={
            measurements.previous
              ? 'Respecto de la medición anterior'
              : 'Se necesitan dos mediciones'
          }
        />

        <MetricCard
          title="Grasa corporal"
          value={
            measurements.latest
              ?.bodyFatPercentage !== null &&
            measurements.latest
              ?.bodyFatPercentage !== undefined
              ? `${measurements.latest.bodyFatPercentage} %`
              : 'Sin datos'
          }
          description={formatChange(
            measurements.bodyFatChange,
            '%',
          )}
        />
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h2 className="h5 mb-1">
                  Mi rutina
                </h2>

                <p className="text-secondary mb-0">
                  Plan de entrenamiento actual.
                </p>
              </div>

              <Link
                to="/client/routine"
                className="btn btn-outline-dark btn-sm"
              >
                Ver rutina
              </Link>
            </div>

            {routine ? (
              <>
                <strong className="h5">
                  {routine.title}
                </strong>

                <p className="text-secondary">
                  {routine.objective ||
                    routine.description ||
                    'Sin descripción adicional.'}
                </p>

                <div className="row g-3 mt-auto">
                  <div className="col-sm-6">
                    <small className="text-secondary d-block">
                      Fecha de inicio
                    </small>

                    <span>
                      {formatDate(
                        routine.startDate,
                      )}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <small className="text-secondary d-block">
                      Fecha de finalización
                    </small>

                    <span>
                      {formatDate(
                        routine.endDate,
                      )}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-secondary mb-0">
                Todavía no tenés una rutina
                activa asignada.
              </p>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h2 className="h5 mb-1">
                  Último seguimiento
                </h2>

                <p className="text-secondary mb-0">
                  Última devolución realizada por
                  Felipe.
                </p>
              </div>

              <Link
                to="/client/progress"
                className="btn btn-outline-dark btn-sm"
              >
                Ver seguimiento
              </Link>
            </div>

            {progress ? (
              <>
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                  <strong className="h5 mb-0">
                    {progress.title}
                  </strong>

                  <span className="badge text-bg-secondary">
                    {formatStatus(
                      progress.status,
                    )}
                  </span>
                </div>

                <p>{progress.comment}</p>

                {progress.nextAction && (
                  <div className="border rounded p-3">
                    <small className="text-secondary d-block mb-1">
                      Próxima acción
                    </small>

                    <span>
                      {progress.nextAction}
                    </span>
                  </div>
                )}

                <small className="text-secondary mt-3">
                  {formatDate(progress.date)}
                </small>
              </>
            ) : (
              <p className="text-secondary mb-0">
                Todavía no hay seguimientos
                disponibles.
              </p>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h2 className="h5 mb-1">
                  Última medición
                </h2>

                <p className="text-secondary mb-0">
                  Resumen de tu registro físico
                  más reciente.
                </p>
              </div>

              <Link
                to="/client/measurements"
                className="btn btn-outline-dark btn-sm"
              >
                Ver mediciones
              </Link>
            </div>

            {measurements.latest ? (
              <div className="row g-4">
                <div className="col-6 col-md-3">
                  <small className="text-secondary d-block">
                    Peso
                  </small>

                  <strong>
                    {measurements.latest.weight ??
                      '-'}{' '}
                    kg
                  </strong>
                </div>

                <div className="col-6 col-md-3">
                  <small className="text-secondary d-block">
                    Cintura
                  </small>

                  <strong>
                    {measurements.latest.waist ??
                      '-'}{' '}
                    cm
                  </strong>
                </div>

                <div className="col-6 col-md-3">
                  <small className="text-secondary d-block">
                    Cadera
                  </small>

                  <strong>
                    {measurements.latest.hip ??
                      '-'}{' '}
                    cm
                  </strong>
                </div>

                <div className="col-6 col-md-3">
                  <small className="text-secondary d-block">
                    Grasa
                  </small>

                  <strong>
                    {measurements.latest
                      .bodyFatPercentage ?? '-'}{' '}
                    %
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-secondary mb-0">
                Todavía no registraste
                mediciones.
              </p>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h2 className="h5 mb-3">
              Accesos rápidos
            </h2>

            <div className="d-grid gap-2">
              <Link
                to="/client/measurements/new"
                className="btn btn-dark"
              >
                Registrar medición
              </Link>

              <Link
                to="/client/profile"
                className="btn btn-outline-dark"
              >
                Actualizar perfil
              </Link>

              <Link
                to="/client/routine"
                className="btn btn-outline-dark"
              >
                Consultar rutina
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClientDashboardPage
