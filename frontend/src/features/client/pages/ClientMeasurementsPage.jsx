import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getMyMeasurementEvolution,
  getMyMeasurements,
} from '../../../services/measurementService'
import MeasurementEvolutionChart from '../../measurements/components/MeasurementEvolutionChart'

const PAGE_SIZE = 10

function formatValue(value, unit) {
  return value !== null && value !== undefined
    ? `${value} ${unit}`
    : '-'
}

function ClientMeasurementsPage() {
  const [measurements, setMeasurements] = useState([])
  const [evolution, setEvolution] = useState([])
  const [page, setPage] = useState(1)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })

  const [loading, setLoading] = useState(true)
  const [evolutionLoading, setEvolutionLoading] =
    useState(true)
  const [error, setError] = useState('')
  const [evolutionError, setEvolutionError] =
    useState('')

  useEffect(() => {
    async function loadMeasurements() {
      try {
        setLoading(true)
        setError('')

        const data = await getMyMeasurements({
          page,
          limit: PAGE_SIZE,
        })

        const loadedMeasurements =
          data.measurements ??
          data.items ??
          data

        setMeasurements(
          Array.isArray(loadedMeasurements)
            ? loadedMeasurements
            : [],
        )

        setPagination(
          data.pagination ?? {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        )
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'No se pudieron cargar tus mediciones',
        )
      } finally {
        setLoading(false)
      }
    }

    loadMeasurements()
  }, [page])

  useEffect(() => {
    async function loadEvolution() {
      try {
        setEvolutionLoading(true)
        setEvolutionError('')

        const data =
          await getMyMeasurementEvolution()

        setEvolution(
          Array.isArray(data.evolution)
            ? data.evolution
            : [],
        )
      } catch (requestError) {
        setEvolutionError(
          requestError.response?.data?.message ||
            'No se pudo cargar tu evolución',
        )
      } finally {
        setEvolutionLoading(false)
      }
    }

    loadEvolution()
  }, [])

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold">
            Mis mediciones
          </h1>

          <p className="text-secondary mb-0">
            Consultá tu evolución física.
          </p>
        </div>

        <Link
          to="/client/measurements/new"
          className="btn btn-dark"
        >
          Nueva medición
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {evolutionError && (
        <div className="alert alert-warning">
          {evolutionError}
        </div>
      )}

      {!evolutionLoading && (
        <div className="row g-4 mb-4">
          <div className="col-xl-6">
            <MeasurementEvolutionChart
              title="Evolución del peso"
              data={evolution}
              dataKey="weight"
              unit="kg"
            />
          </div>

          <div className="col-xl-6">
            <MeasurementEvolutionChart
              title="Evolución de grasa corporal"
              data={evolution}
              dataKey="bodyFatPercentage"
              unit="%"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p>Cargando mediciones...</p>
      ) : measurements.length === 0 ? (
        <div className="card border-0 shadow-sm p-4">
          No tenés mediciones registradas.
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Fecha</th>
                  <th>Peso</th>
                  <th>Cintura</th>
                  <th>Cadera</th>
                  <th>Pecho</th>
                  <th>Brazo</th>
                  <th>Pierna</th>
                  <th>Grasa corporal</th>
                  <th className="text-end pe-4">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {measurements.map((measurement) => (
                  <tr key={measurement.id}>
                    <td className="ps-4">
                      {measurement.date}
                    </td>

                    <td>
                      {formatValue(
                        measurement.weight,
                        'kg',
                      )}
                    </td>

                    <td>
                      {formatValue(
                        measurement.waist,
                        'cm',
                      )}
                    </td>

                    <td>
                      {formatValue(
                        measurement.hip,
                        'cm',
                      )}
                    </td>

                    <td>
                      {formatValue(
                        measurement.chest,
                        'cm',
                      )}
                    </td>

                    <td>
                      {formatValue(
                        measurement.arm,
                        'cm',
                      )}
                    </td>

                    <td>
                      {formatValue(
                        measurement.leg,
                        'cm',
                      )}
                    </td>

                    <td>
                      {formatValue(
                        measurement.bodyFatPercentage,
                        '%',
                      )}
                    </td>

                    <td className="text-end pe-4">
                      <Link
                        to={`/client/measurements/${measurement.id}/edit`}
                        className="btn btn-outline-dark btn-sm"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center border-top p-3">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              disabled={
                pagination.page <= 1 ||
                loading
              }
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
            >
              Anterior
            </button>

            <span className="text-secondary small">
              Página {pagination.page} de{' '}
              {pagination.totalPages}
              {' · '}
              {pagination.total} medición(es)
            </span>

            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              disabled={
                pagination.page >=
                  pagination.totalPages ||
                loading
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    pagination.totalPages,
                    current + 1,
                  ),
                )
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

export default ClientMeasurementsPage
