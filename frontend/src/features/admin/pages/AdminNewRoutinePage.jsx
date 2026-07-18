import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createRoutine } from '../../../services/routineService'

function createEmptyExercise(order) {
  return {
    tempId: `${Date.now()}-${Math.random()}`,
    order,
    dayOfWeek: '',
    exerciseName: '',
    series: '',
    amount: '',
    unit: 'repeticiones',
    notes: '',
  }
}

function AdminNewRoutinePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    startDate: '',
    endDate: '',
    notes: '',
  })

  const [exercises, setExercises] = useState([
    createEmptyExercise(1),
  ])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleExerciseChange = (tempId, event) => {
    const { name, value } = event.target

    setExercises((current) =>
      current.map((exercise) =>
        exercise.tempId === tempId
          ? { ...exercise, [name]: value }
          : exercise,
      ),
    )
  }

  const addExercise = () => {
    setExercises((current) => [
      ...current,
      createEmptyExercise(current.length + 1),
    ])
  }

  const removeExercise = (tempId) => {
    setExercises((current) =>
      current
        .filter((exercise) => exercise.tempId !== tempId)
        .map((exercise, index) => ({
          ...exercise,
          order: index + 1,
        })),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.endDate < formData.startDate) {
      setError('La fecha de finalización no puede ser anterior al inicio.')
      return
    }

    try {
      setSaving(true)
      setError('')

      await createRoutine({
        clientId: Number(id),
        title: formData.title,
        description: formData.description,
        objective: formData.objective,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
        exercises: exercises.map((exercise) => ({
          order: exercise.order,
          dayOfWeek: exercise.dayOfWeek || null,
          exerciseName: exercise.exerciseName,
          series: Number(exercise.series),
          amount: Number(exercise.amount),
          unit: exercise.unit,
          notes: exercise.notes || null,
        })),
      })

      navigate(`/admin/clients/${id}`, { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo crear la rutina',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to={`/admin/clients/${id}`}
          className="text-decoration-none"
        >
          ← Volver al perfil
        </Link>

        <h1 className="h3 fw-bold mt-3">Nueva rutina</h1>

        <p className="text-secondary">
          La rutina activa anterior pasará automáticamente al historial.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="card border-0 shadow-sm p-4 mb-4">
          <h2 className="h5 mb-3">Datos generales</h2>

          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="title" className="form-label">
                Título
              </label>

              <input
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="objective" className="form-label">
                Objetivo
              </label>

              <input
                id="objective"
                name="objective"
                className="form-control"
                value={formData.objective}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="startDate" className="form-label">
                Fecha de inicio
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                className="form-control"
                value={formData.startDate}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="endDate" className="form-label">
                Fecha de finalización
              </label>

              <input
                id="endDate"
                name="endDate"
                type="date"
                min={formData.startDate}
                className="form-control"
                value={formData.endDate}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="col-12">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>

              <textarea
                id="description"
                name="description"
                rows="3"
                className="form-control"
                value={formData.description}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-12">
              <label htmlFor="notes" className="form-label">
                Indicaciones generales
              </label>

              <textarea
                id="notes"
                name="notes"
                rows="3"
                className="form-control"
                value={formData.notes}
                onChange={handleFormChange}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4">
          <h2 className="h5 mb-4">Ejercicios</h2>

          {exercises.map((exercise, index) => (
            <div
              key={exercise.tempId}
              className="border rounded p-3 mb-3"
            >
              <div className="d-flex justify-content-between mb-3">
                <strong>Ejercicio {index + 1}</strong>

                {exercises.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      removeExercise(exercise.tempId)
                    }
                  >
                    Quitar
                  </button>
                )}
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Ejercicio
                  </label>

                  <input
                    name="exerciseName"
                    className="form-control"
                    value={exercise.exerciseName}
                    onChange={(event) =>
                      handleExerciseChange(
                        exercise.tempId,
                        event,
                      )
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Día opcional
                  </label>

                  <select
                    name="dayOfWeek"
                    className="form-select"
                    value={exercise.dayOfWeek}
                    onChange={(event) =>
                      handleExerciseChange(
                        exercise.tempId,
                        event,
                      )
                    }
                  >
                    <option value="">Sin asignar</option>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Series
                  </label>

                  <input
                    name="series"
                    type="number"
                    min="1"
                    className="form-control"
                    value={exercise.series}
                    onChange={(event) =>
                      handleExerciseChange(
                        exercise.tempId,
                        event,
                      )
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Cantidad
                  </label>

                  <input
                    name="amount"
                    type="number"
                    min="1"
                    className="form-control"
                    value={exercise.amount}
                    onChange={(event) =>
                      handleExerciseChange(
                        exercise.tempId,
                        event,
                      )
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Unidad
                  </label>

                  <select
                    name="unit"
                    className="form-select"
                    value={exercise.unit}
                    onChange={(event) =>
                      handleExerciseChange(
                        exercise.tempId,
                        event,
                      )
                    }
                  >
                    <option value="repeticiones">
                      Repeticiones
                    </option>
                    <option value="segundos">
                      Segundos
                    </option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Indicaciones del ejercicio
                  </label>

                  <input
                    name="notes"
                    className="form-control"
                    value={exercise.notes}
                    onChange={(event) =>
                      handleExerciseChange(
                        exercise.tempId,
                        event,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="d-grid mb-4">
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={addExercise}
            >
              + Agregar ejercicio
            </button>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Link
              to={`/admin/clients/${id}`}
              className="btn btn-outline-secondary"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="btn btn-dark"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar rutina'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default AdminNewRoutinePage

