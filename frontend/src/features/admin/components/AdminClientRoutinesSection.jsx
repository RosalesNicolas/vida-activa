import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  activateRoutine,
  deactivateRoutine,
  getRoutinesByClient,
} from '../../../services/routineService'

const PAGE_SIZE = 5

function CurrentRoutineCard({ routine, clientId, onDeactivate, actionLoading }) {
  const exercises =
    routine.exercises ??
    routine.RoutineExercises ??
    routine.routineExercises ??
    []

  return (
    <div className="card border shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h3 className="h5 mb-1">{routine.title}</h3>
            <span className="text-secondary">
              Versión {routine.version}
            </span>
          </div>

          <span className="badge routine-active-badge">Activa</span>
        </div>

        <p>
          <strong>Objetivo:</strong>{' '}
          {routine.objective || 'Sin definir'}
        </p>

        <p>
          <strong>Período:</strong>{' '}
          {routine.startDate || 'Sin fecha'} —{' '}
          {routine.endDate || 'Sin fecha'}
        </p>

        {routine.description && <p>{routine.description}</p>}

        <h4 className="h6 mt-4">Ejercicios</h4>

        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Día</th>
                <th>Ejercicio</th>
                <th>Trabajo</th>
              </tr>
            </thead>

            <tbody>
              {exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.order}</td>
                  <td>{exercise.dayOfWeek || 'Sin asignar'}</td>
                  <td>{exercise.exerciseName}</td>
                  <td>
                    {exercise.series} × {exercise.amount}{' '}
                    {exercise.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex gap-2">
          <Link
            to={`/admin/clients/${clientId}/routines/${routine.id}/edit`}
            className="btn btn-outline-dark btn-sm"
          >
            Editar rutina
          </Link>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            disabled={actionLoading}
            onClick={() => onDeactivate(routine.id)}
          >
            {actionLoading ? 'Procesando...' : 'Desactivar rutina'}
          </button>
        </div>
      </div>
    </div>
  )
}

function HistoryRoutineCard({ routine, onActivate, actionLoading }) {
  return (
    <div className="card border shadow-sm mb-3">
      <div className="card-body d-flex justify-content-between align-items-center gap-3">
        <div>
          <h3 className="h6 mb-1">{routine.title}</h3>

          <div className="text-secondary small">
            Versión {routine.version} ·{' '}
            {routine.startDate || 'Sin fecha'} —{' '}
            {routine.endDate || 'Sin fecha'}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          disabled={actionLoading}
          onClick={() => onActivate(routine.id)}
        >
          {actionLoading ? 'Procesando...' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

function AdminClientRoutinesSection({ clientId }) {
  const [currentRoutine, setCurrentRoutine] = useState(null)
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })

  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')

  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getRoutinesByClient(
        clientId,
        {
          page: historyPage,
          limit: PAGE_SIZE,
        },
      )

      setCurrentRoutine(data.currentRoutine ?? null)
      setHistory(data.history ?? [])

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
          'No se pudieron cargar las rutinas',
      )
    } finally {
      setLoading(false)
    }
  }, [clientId, historyPage])

  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

  const handleDeactivate = async (routineId) => {
    const confirmed = window.confirm(
      '¿Desactivar esta rutina? El cliente quedará sin rutina actual.',
    )

    if (!confirmed) return

    try {
      setActionId(routineId)
      setError('')

      await deactivateRoutine(routineId)
      await loadRoutines()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo desactivar la rutina',
      )
    } finally {
      setActionId(null)
    }
  }

  const handleActivate = async (routineId) => {
    try {
      setActionId(routineId)
      setError('')

      await activateRoutine(routineId)
      await loadRoutines()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo activar la rutina',
      )
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return <p>Cargando rutinas...</p>
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 mb-1">Rutinas</h2>
          <p className="text-secondary mb-0">
            Rutina vigente e historial del cliente.
          </p>
        </div>

        <Link
          to={`/admin/clients/${clientId}/routines/new`}
          className="btn btn-dark"
        >
          Nueva rutina
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <h3 className="h6 fw-bold">Rutina actual</h3>

      {currentRoutine ? (
        <CurrentRoutineCard
          routine={currentRoutine}
          clientId={clientId}
          onDeactivate={handleDeactivate}
          actionLoading={actionId === currentRoutine.id}
        />
      ) : (
        <div className="alert alert-warning">
          El cliente no tiene una rutina activa.
        </div>
      )}

      <h3 className="h6 fw-bold mt-4">Historial</h3>

      {history.length === 0 ? (
        <p className="text-secondary">
          No existen rutinas anteriores.
        </p>
      ) : (
        <>
          {history.map((routine) => (
            <HistoryRoutineCard
              key={routine.id}
              routine={routine}
              onActivate={handleActivate}
              actionLoading={
                actionId === routine.id
              }
            />
          ))}

          <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              disabled={
                pagination.page <= 1 ||
                loading
              }
              onClick={() =>
                setHistoryPage((current) =>
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
              {pagination.total}{' '}
              rutina(s) anteriores
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
                setHistoryPage((current) =>
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
        </>
      )}
    </section>
  )
}

export default AdminClientRoutinesSection





