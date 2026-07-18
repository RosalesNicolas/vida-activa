import { useEffect, useState } from 'react'
import {
  getMyProgress,
  updateMyProgressComment,
} from '../../../services/progressService'

const PAGE_SIZE = 5

function getStatusBadgeClass(status) {
  const normalizedStatus = status
    ?.toLowerCase()
    .replaceAll('_', ' ')
    .trim()

  switch (normalizedStatus) {
    case 'positivo':
    case 'cumplido':
    case 'completado':
      return 'text-bg-success'

    case 'en proceso':
      return 'text-bg-primary'

    case 'requiere atención':
    case 'pendiente':
      return 'status-attention-badge'

    case 'finalizado':
      return 'text-bg-dark'

    default:
      return 'text-bg-secondary'
  }
}

function formatStatus(status) {
  if (!status) return 'Sin estado'

  const formattedStatus =
    status.replaceAll('_', ' ')

  return (
    formattedStatus.charAt(0).toUpperCase() +
    formattedStatus.slice(1)
  )
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString('es-AR')
}

function ClientProgressNote({
  note,
  onCommentSaved,
}) {
  const [
    clientComment,
    setClientComment,
  ] = useState(
    note.clientComment ?? '',
  )

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const canEdit =
    note.clientCommentEditable !== false

  useEffect(() => {
    setClientComment(
      note.clientComment ?? '',
    )
  }, [note.clientComment])

  const handleSave = async () => {
    if (!clientComment.trim()) {
      setError(
        'La respuesta no puede estar vacía',
      )
      return
    }

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const data =
        await updateMyProgressComment(
          note.id,
          clientComment,
        )

      const savedNote =
        data.progressNote ?? data

      onCommentSaved(savedNote)

      setMessage(
        'Respuesta enviada correctamente.',
      )
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'No se pudo guardar la respuesta',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card border-0 shadow-sm mb-3 progress-note-card">
      <div className="card-body">
        <div className="progress-note-header">
          <div>
            <h2 className="h6 mb-1">
              {note.title ||
                'Nota de seguimiento'}
            </h2>

            <span className="text-secondary small">
              {formatDate(note.date)}
            </span>
          </div>

          <span
            className={`badge progress-status-badge ${getStatusBadgeClass(
              note.status,
            )}`}
          >
            {formatStatus(note.status)}
          </span>
        </div>

        <p>
          {note.comment || 'Sin comentario'}
        </p>

        {note.nextAction && (
          <p>
            <strong>Próxima acción:</strong>{' '}
            {note.nextAction}
          </p>
        )}

        <div className="border-top pt-3 mt-3">
          <label
            htmlFor={`clientComment-${note.id}`}
            className="form-label fw-semibold"
          >
            {note.clientComment
              ? 'Mi respuesta'
              : 'Responder seguimiento'}
          </label>

          <textarea
            id={`clientComment-${note.id}`}
            className="form-control"
            rows="3"
            maxLength="500"
            disabled={!canEdit || saving}
            placeholder="Escribí una respuesta breve..."
            value={clientComment}
            onChange={(event) => {
              setClientComment(
                event.target.value,
              )
              setMessage('')
              setError('')
            }}
          />

          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-secondary">
              {clientComment.length}/500
            </small>

            {canEdit && (
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                disabled={saving}
                onClick={handleSave}
              >
                {saving
                  ? 'Enviando...'
                  : note.clientComment
                    ? 'Guardar modificación'
                    : 'Enviar respuesta'}
              </button>
            )}
          </div>

          {!canEdit && note.clientComment && (
            <div className="alert alert-light border small mt-3 mb-0">
              La respuesta ya fue enviada.
              Para modificarla, Felipe debe
              habilitar nuevamente la edición.
            </div>
          )}

          {message && (
            <div className="text-success small mt-2">
              {message}
            </div>
          )}

          {error && (
            <div className="text-danger small mt-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClientProgressPage() {
  const [notes, setNotes] =
    useState([])

  const [page, setPage] =
    useState(1)

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: PAGE_SIZE,
      total: 0,
      totalPages: 1,
    })

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true)
        setError('')

        const data = await getMyProgress({
          page,
          limit: PAGE_SIZE,
        })

        const loadedNotes =
          data.progressNotes ??
          data.progress ??
          data.notes ??
          data.items ??
          data

        setNotes(
          Array.isArray(loadedNotes)
            ? loadedNotes
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
          requestError.response?.data
            ?.message ||
          'No se pudo cargar tu seguimiento',
        )

        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [page])

  const handleCommentSaved = (
    updatedNote,
  ) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === updatedNote.id
          ? updatedNote
          : note,
      ),
    )
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold">
          Mi seguimiento
        </h1>

        <p className="text-secondary mb-0">
          Consultá las observaciones
          compartidas por Felipe.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando seguimiento...</p>
      ) : notes.length === 0 ? (
        <div className="card border-0 shadow-sm p-4">
          No tenés notas de seguimiento
          disponibles.
        </div>
      ) : (
        <>
          {notes.map((note) => (
            <ClientProgressNote
              key={note.id}
              note={note}
              onCommentSaved={
                handleCommentSaved
              }
            />
          ))}

          <div className="d-flex justify-content-between align-items-center border-top pt-3">
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
              {pagination.total}{' '}
              seguimiento(s)
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
        </>
      )}
    </>
  )
}

export default ClientProgressPage

