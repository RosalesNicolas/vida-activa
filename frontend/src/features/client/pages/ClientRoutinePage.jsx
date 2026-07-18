import { useEffect, useState } from 'react'
import { getMyRoutines } from '../../../services/routineService'

const PAGE_SIZE = 5

function ExerciseTable({ routine }) {
  const exercises =
    routine.exercises ??
    routine.RoutineExercises ??
    routine.routineExercises ??
    []

  if (exercises.length === 0) {
    return (
      <p className="text-secondary mb-0">
        Esta rutina no tiene ejercicios cargados.
      </p>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>Día</th>
            <th>Ejercicio</th>
            <th>Trabajo</th>
            <th>Indicaciones</th>
          </tr>
        </thead>

        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id}>
              <td>{exercise.dayOfWeek || 'Sin asignar'}</td>

              <td>{exercise.exerciseName}</td>

              <td>
                {exercise.series} × {exercise.amount}{' '}
                {exercise.unit}
              </td>

              <td>{exercise.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ClientRoutinePage() {
  const [currentRoutine, setCurrentRoutine] = useState(null)
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })

  const [expandedRoutineId, setExpandedRoutineId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRoutines() {
      try {
        setLoading(true)
        setError('')

        const data = await getMyRoutines({
          page: historyPage,
          limit: PAGE_SIZE,
        })

        setCurrentRoutine(
          data.currentRoutine ?? null,
        )

        setHistory(data.history ?? [])

        setPagination(
          data.pagination ?? {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        )

        setExpandedRoutineId(null)
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'No se pudieron cargar tus rutinas',
        )
      } finally {
        setLoading(false)
      }
    }

    loadRoutines()
  }, [historyPage])

  if (loading) {
    return <p>Cargando rutina...</p>
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold">Mi rutina</h1>

        <p className="text-secondary mb-0">
          Consultá tu entrenamiento actual y las rutinas anteriores.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <h2 className="h5 fw-bold mb-3">Rutina actual</h2>

      {currentRoutine ? (
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h3 className="h4 mb-1">
                  {currentRoutine.title}
                </h3>

                <span className="text-secondary">
                  Versión {currentRoutine.version}
                </span>
              </div>

              <span className="badge routine-active-badge">
                Activa
              </span>
            </div>

            <p>
              <strong>Objetivo:</strong>{' '}
              {currentRoutine.objective || 'Sin definir'}
            </p>

            <p>
              <strong>Período:</strong>{' '}
              {currentRoutine.startDate || 'Sin fecha'} —{' '}
              {currentRoutine.endDate || 'Sin fecha'}
            </p>

            {currentRoutine.description && (
              <p>{currentRoutine.description}</p>
            )}

            {currentRoutine.notes && (
              <div className="alert alert-light border">
                <strong>Indicaciones generales:</strong>{' '}
                {currentRoutine.notes}
              </div>
            )}

            <ExerciseTable routine={currentRoutine} />
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">
          Actualmente no tenés una rutina activa.
        </div>
      )}

      <h2 className="h5 fw-bold mb-3">Historial</h2>

      {history.length === 0 ? (
        <p className="text-secondary">
          No tenés rutinas anteriores.
        </p>
      ) : (
        <>
          {history.map((routine) => {
            const expanded =
              expandedRoutineId === routine.id

            return (
              <div
                key={routine.id}
                className="card border-0 shadow-sm mb-3"
              >
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    <div>
                      <h3 className="h6 mb-1">
                        {routine.title}
                      </h3>

                      <span className="text-secondary small">
                        Versión {routine.version} ·{' '}
                        {routine.startDate ||
                          'Sin fecha'}{' '}
                        —{' '}
                        {routine.endDate ||
                          'Sin fecha'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm"
                      onClick={() =>
                        setExpandedRoutineId(
                          expanded
                            ? null
                            : routine.id,
                        )
                      }
                    >
                      {expanded
                        ? 'Ocultar'
                        : 'Ver rutina'}
                    </button>
                  </div>

                  {expanded && (
                    <div className="mt-4">
                      <ExerciseTable
                        routine={routine}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

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
    </>
  )
}

export default ClientRoutinePage

