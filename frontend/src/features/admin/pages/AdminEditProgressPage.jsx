import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getProgressByClient,
  updateProgressNote,
} from '../../../services/progressService'

function normalizeStatusValue(value) {
  const normalized = String(
    value || 'en_proceso',
  )
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  const allowedStatuses = [
    'positivo',
    'en_proceso',
    'requiere_atencion',
    'finalizado',
  ]

  return allowedStatuses.includes(normalized)
    ? normalized
    : 'en_proceso'
}

function AdminEditProgressPage() {
  const { id, progressId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgressNote() {
      try {
        setLoading(true)
        setError('')

        const data = await getProgressByClient(id)

        const notes =
          data.progress ??
          data.notes ??
          data.progressNotes ??
          data.items ??
          data

        const normalizedNotes = Array.isArray(notes) ? notes : []

        const note = normalizedNotes.find(
          (item) => String(item.id) === String(progressId),
        )

        if (!note) {
          throw new Error('Nota de seguimiento no encontrada')
        }

        setFormData({
          date: note.date ?? '',
          title: note.title ?? '',
          comment: note.comment ?? '',
          status: normalizeStatusValue(note.status),
          nextAction: note.nextAction ?? '',
          visibleToClient: Boolean(note.visibleToClient),
        })
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            'No se pudo cargar la nota',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProgressNote()
  }, [id, progressId])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      await updateProgressNote(progressId, {
        date: formData.date,
        title: formData.title,
        comment: formData.comment,
        status: formData.status,
        nextAction: formData.nextAction || null,
        visibleToClient: formData.visibleToClient,
      })

      navigate(`/admin/clients/${id}`, { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo actualizar la nota',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Cargando nota...</p>
  }

  if (!formData) {
    return <div className="alert alert-danger">{error}</div>
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

        <h1 className="h3 fw-bold mt-3">
          Editar nota de seguimiento
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card border-0 shadow-sm p-4"
      >
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="date" className="form-label">
              Fecha
            </label>

            <input
              id="date"
              name="date"
              type="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="status" className="form-label">
              Estado
            </label>

            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="positivo">Positivo</option>
              <option value="en_proceso">En proceso</option>
              <option value="requiere_atencion">
                Requiere atención
              </option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <div className="col-12">
            <label htmlFor="title" className="form-label">
              Título
            </label>

            <input
              id="title"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="comment" className="form-label">
              Comentario
            </label>

            <textarea
              id="comment"
              name="comment"
              rows="4"
              className="form-control"
              value={formData.comment}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="nextAction" className="form-label">
              Próxima acción
            </label>

            <input
              id="nextAction"
              name="nextAction"
              className="form-control"
              value={formData.nextAction}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                id="visibleToClient"
                name="visibleToClient"
                type="checkbox"
                className="form-check-input"
                checked={formData.visibleToClient}
                onChange={handleChange}
              />

              <label
                htmlFor="visibleToClient"
                className="form-check-label"
              >
                Visible para el cliente
              </label>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
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
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </>
  )
}

export default AdminEditProgressPage

