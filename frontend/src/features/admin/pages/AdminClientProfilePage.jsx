import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClientById } from '../../../services/clientService'
import {
  deleteMeasurement,
  getMeasurementEvolutionByClient,
  getMeasurementsByClient,
} from '../../../services/measurementService'
import AdminClientRoutinesSection from '../components/AdminClientRoutinesSection'
import AdminClientProgressSection from '../components/AdminClientProgressSection'
import MeasurementEvolutionChart from '../../measurements/components/MeasurementEvolutionChart'

const MEASUREMENT_PAGE_SIZE = 10

function formatSex(value) {
  const labels = {
    female: 'Femenino',
    male: 'Masculino',
    other: 'Otro',
    preferNotToSay: 'Prefiere no decirlo',
  }

  return labels[value] || 'Sin definir'
}

function calculateAge(birthDate) {
  if (!birthDate) return null

  const today = new Date()
  const birth = new Date(`${birthDate}T00:00:00`)

  let age =
    today.getFullYear() - birth.getFullYear()

  const monthDifference =
    today.getMonth() - birth.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age -= 1
  }

  return age >= 0 ? age : null
}

function AdminClientProfilePage() {
  const { id } = useParams()

  const [client, setClient] = useState(null)
  const [measurements, setMeasurements] = useState([])

  const [
    measurementEvolution,
    setMeasurementEvolution,
  ] = useState([])
  const [activeSection, setActiveSection] =
    useState('data')
  const [measurementPage, setMeasurementPage] =
    useState(1)

  const [
    measurementPagination,
    setMeasurementPagination,
  ] = useState({
    page: 1,
    limit: MEASUREMENT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })

  const [loading, setLoading] = useState(true)
  const [
    measurementsLoading,
    setMeasurementsLoading,
  ] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [
    measurementsError,
    setMeasurementsError,
  ] = useState('')

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true)
        setError('')

        const data = await getClientById(id)
        setClient(data.client ?? data)
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'No se pudo cargar el cliente',
        )
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [id])

  const loadMeasurements = useCallback(async () => {
    try {
      setMeasurementsLoading(true)
      setMeasurementsError('')

      const [
        measurementData,
        evolutionData,
      ] = await Promise.all([
        getMeasurementsByClient(id, {
          page: measurementPage,
          limit: MEASUREMENT_PAGE_SIZE,
        }),
        getMeasurementEvolutionByClient(id),
      ])

      const loadedMeasurements =
        measurementData.measurements ??
        measurementData

      setMeasurements(
        Array.isArray(loadedMeasurements)
          ? loadedMeasurements
          : [],
      )

      setMeasurementPagination(
        measurementData.pagination ?? {
          page: 1,
          limit: MEASUREMENT_PAGE_SIZE,
          total: 0,
          totalPages: 1,
        },
      )

      setMeasurementEvolution(
        Array.isArray(evolutionData.evolution)
          ? evolutionData.evolution
          : [],
      )
    } catch (requestError) {
      setMeasurementsError(
        requestError.response?.data?.message ||
          'No se pudieron cargar las mediciones',
      )
    } finally {
      setMeasurementsLoading(false)
    }
  }, [id, measurementPage])

  useEffect(() => {
    if (activeSection !== 'measurements') return

    loadMeasurements()
  }, [activeSection, loadMeasurements])

  const handleDeleteMeasurement = async (
    measurementId,
  ) => {
    const confirmed = window.confirm(
      '¿Eliminar esta medición? Esta acción no se puede deshacer.',
    )

    if (!confirmed) return

    try {
      setDeletingId(measurementId)
      setMeasurementsError('')

      await deleteMeasurement(measurementId)

      if (
        measurements.length === 1 &&
        measurementPage > 1
      ) {
        setMeasurementPage((current) =>
          Math.max(1, current - 1),
        )
      } else {
        await loadMeasurements()
      }
    } catch (requestError) {
      setMeasurementsError(
        requestError.response?.data?.message ||
          'No se pudo eliminar la medición',
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <p>Cargando cliente...</p>
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  if (!client) {
    return (
      <div className="alert alert-warning">
        Cliente no encontrado.
      </div>
    )
  }

  const user = client.user ?? client.User ?? {}

  return (
    <>
      <div className="mb-4">
        <Link
          to="/admin/clients"
          className="text-decoration-none"
        >
          ← Volver a clientes
        </Link>

        <h1 className="h3 fw-bold mt-3">
          {user.name || 'Cliente'}
        </h1>

        <p className="text-secondary mb-0">
          Administración completa del cliente.
        </p>

        <Link
          to={`/admin/clients/${id}/edit`}
          className="btn btn-outline-dark btn-sm mt-3"
        >
          Editar datos
        </Link>
      </div>

      <div className="nav nav-pills gap-2 mb-4">
        <button
          type="button"
          className={`nav-link ${
            activeSection === 'data'
              ? 'active'
              : ''
          }`}
          onClick={() => setActiveSection('data')}
        >
          Datos personales
        </button>

        <button
          type="button"
          className={`nav-link ${
            activeSection === 'measurements'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveSection('measurements')
          }
        >
          Mediciones
        </button>

        <button
          type="button"
          className={`nav-link ${
            activeSection === 'routines'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveSection('routines')
          }
        >
          Rutinas
        </button>

        <button
          type="button"
          className={`nav-link ${
            activeSection === 'progress'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveSection('progress')
          }
        >
          Seguimiento
        </button>
      </div>

      {activeSection === 'data' && (
        <div className="card border-0 shadow-sm p-4">
          <h2 className="h5 mb-4">
            Datos personales
          </h2>

          <div className="row g-4">
            <div className="col-md-6">
              <strong>Nombre</strong>
              <p>{user.name || 'Sin definir'}</p>
            </div>

            <div className="col-md-6">
              <strong>Email</strong>
              <p>{user.email || 'Sin definir'}</p>
            </div>

            <div className="col-md-6">
              <strong>Estado</strong>
              <p>
                {user.active ? 'Activo' : 'Inactivo'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Teléfono</strong>
              <p>{client.phone || 'Sin definir'}</p>
            </div>

            <div className="col-md-6">
              <strong>Fecha de nacimiento</strong>
              <p>
                {client.birthDate || 'Sin definir'}

                {calculateAge(client.birthDate) !== null
                  ? ` (${calculateAge(client.birthDate)} años)`
                  : ''}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Sexo</strong>
              <p>{formatSex(client.sex)}</p>
            </div>

            <div className="col-md-6">
              <strong>Altura</strong>
              <p>
                {client.height
                  ? `${client.height} m`
                  : 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Dirección</strong>
              <p>{client.address || 'Sin definir'}</p>
            </div>

            <div className="col-md-6">
              <strong>Ocupación</strong>
              <p>
                {client.occupation || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Fecha de inicio</strong>
              <p>
                {client.startDate || 'Sin definir'}
              </p>
            </div>

            <div className="col-12">
              <strong>Objetivo</strong>
              <p>
                {client.objective || 'Sin definir'}
              </p>
            </div>
          </div>

          <hr className="my-4" />

          <h2 className="h5 mb-4">
            Información de salud
          </h2>

          <div className="row g-4">
            <div className="col-md-6">
              <strong>Lesiones o limitaciones</strong>
              <p>
                {client.injuries || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Enfermedades</strong>
              <p>
                {client.diseases || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Medicación</strong>
              <p>
                {client.medications || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Observaciones</strong>
              <p>
                {client.observations ||
                  'Sin observaciones'}
              </p>
            </div>
          </div>

          <hr className="my-4" />

          <h2 className="h5 mb-4">
            Contacto de emergencia
          </h2>

          <div className="row g-4">
            <div className="col-md-6">
              <strong>Nombre</strong>
              <p>
                {client.emergencyContactName ||
                  'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Teléfono</strong>
              <p>
                {client.emergencyContactPhone ||
                  'Sin definir'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'measurements' && (
        <div className="card border-0 shadow-sm">
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <div>
              <h2 className="h5 mb-1">
                Mediciones
              </h2>

              <p className="text-secondary mb-0">
                Historial físico del cliente.
              </p>
            </div>

            <Link
              to={`/admin/clients/${id}/measurements/new`}
              className="btn btn-dark"
            >
              Nueva medición
            </Link>
          </div>

          {measurementsError && (
            <div className="alert alert-danger m-4">
              {measurementsError}
            </div>
          )}

          {!measurementsLoading && (
            <div className="p-4 border-bottom bg-light">
              <div className="row g-4">
                <div className="col-xl-6">
                  <MeasurementEvolutionChart
                    title="Evolución del peso"
                    data={measurementEvolution}
                    dataKey="weight"
                    unit="kg"
                  />
                </div>

                <div className="col-xl-6">
                  <MeasurementEvolutionChart
                    title="Evolución de grasa corporal"
                    data={measurementEvolution}
                    dataKey="bodyFatPercentage"
                    unit="%"
                  />
                </div>
              </div>
            </div>
          )}

          {measurementsLoading ? (
            <p className="p-4 mb-0">
              Cargando mediciones...
            </p>
          ) : measurements.length === 0 ? (
            <p className="p-4 mb-0">
              No hay mediciones registradas.
            </p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="ps-4">
                        Fecha
                      </th>
                      <th>Peso</th>
                      <th>Cintura</th>
                      <th>Cadera</th>
                      <th>Grasa corporal</th>
                      <th className="text-end pe-4">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {measurements.map(
                      (measurement) => (
                        <tr key={measurement.id}>
                          <td className="ps-4">
                            {measurement.date}
                          </td>

                          <td>
                            {measurement.weight} kg
                          </td>

                          <td>
                            {measurement.waist} cm
                          </td>

                          <td>
                            {measurement.hip} cm
                          </td>

                          <td>
                            {
                              measurement.bodyFatPercentage
                            }{' '}
                            %
                          </td>

                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              <Link
                                to={`/admin/clients/${id}/measurements/${measurement.id}/edit`}
                                className="btn btn-outline-dark btn-sm"
                              >
                                Editar
                              </Link>

                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                disabled={
                                  deletingId ===
                                  measurement.id
                                }
                                onClick={() =>
                                  handleDeleteMeasurement(
                                    measurement.id,
                                  )
                                }
                              >
                                {deletingId ===
                                measurement.id
                                  ? 'Eliminando...'
                                  : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top p-3">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm"
                  disabled={
                    measurementPagination.page <=
                      1 ||
                    measurementsLoading
                  }
                  onClick={() =>
                    setMeasurementPage((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                >
                  Anterior
                </button>

                <span className="text-secondary small">
                  Página{' '}
                  {measurementPagination.page} de{' '}
                  {
                    measurementPagination.totalPages
                  }
                  {' · '}
                  {measurementPagination.total}{' '}
                  medición(es)
                </span>

                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm"
                  disabled={
                    measurementPagination.page >=
                      measurementPagination.totalPages ||
                    measurementsLoading
                  }
                  onClick={() =>
                    setMeasurementPage((current) =>
                      Math.min(
                        measurementPagination.totalPages,
                        current + 1,
                      ),
                    )
                  }
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeSection === 'routines' && (
        <AdminClientRoutinesSection
          clientId={id}
        />
      )}

      {activeSection === 'progress' && (
        <AdminClientProgressSection
          clientId={id}
        />
      )}
    </>
  )
}

export default AdminClientProfilePage







