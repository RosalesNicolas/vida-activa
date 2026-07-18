import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getProgressByClient,
  setProgressCommentEditing,
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

  const normalizedStatus =
    status.replaceAll('_', ' ')

  return (
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1)
  )
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString('es-AR')
}

function AdminClientProgressSection({
  clientId,
}) {
  const [notes, setNotes] = useState([])
  const [page, setPage] = useState(1)

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

  const [
    commentEditingId,
    setCommentEditingId,
  ] = useState(null)

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getProgressByClient(
            clientId,
            {
              page,
              limit: PAGE_SIZE,
            },
          )

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
        console.error(requestError)

        setError(
          requestError.response?.data
            ?.message ||
            'No se pudo cargar el seguimiento',
        )

        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [clientId, page])

  const handleCommentEditing = async (
    note,
  ) => {
    try {
      setCommentEditingId(note.id)
      setError('')

      const data =
        await setProgressCommentEditing(
          note.id,
          true,
        )

      const updatedNote =
        data.progressNote ?? data

      setNotes((current) =>
        current.map((currentNote) =>
          currentNote.id === updatedNote.id
            ? updatedNote
            : currentNote,
        ),
      )
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'No se pudo habilitar la edición',
      )
    } finally {
      setCommentEditingId(null)
    }
  }

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="h5 mb-1">
            Seguimiento
          </h2>

          <p className="text-secondary mb-0">
            Evolución y observaciones del
            cliente.
          </p>
        </div>

        <Link
          to={`/admin/clients/${clientId}/progress/new`}
          className="btn btn-dark"
        >
          Nueva nota
        </Link>
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
          No hay notas de seguimiento
          registradas.
        </div>
      ) : (
        <>
          {notes.map((note) => (
            <div
              key={note.id}
              className="card border-0 shadow-sm mb-3 progress-note-card"
            >
              <div className="card-body">
                <div className="progress-note-header">
                  <div>
                    <h3 className="h6 mb-1">
                      {note.title ||
                        'Nota de seguimiento'}
                    </h3>

                    <span className="text-secondary small">
                      {formatDate(note.date)}
                    </span>
                  </div>

                  <span
                    className={`badge progress-status-badge ${getStatusBadgeClass(
                      note.status,
                    )}`}
                  >
                    {formatStatus(
                      note.status,
                    )}
                  </span>
                </div>

                <p>
                  {note.comment ||
                    'Sin comentario'}
                </p>

                {note.nextAction && (
                  <p className="mb-2">
                    <strong>
                      Próxima acción:
                    </strong>{' '}
                    {note.nextAction}
                  </p>
                )}

                <small className="text-secondary">
                  {note.visibleToClient
                    ? 'Visible para el cliente'
                    : 'Nota privada del administrador'}
                </small>

                {note.clientComment && (
                  <div className="alert alert-light border mt-3 mb-0">
                    <strong>
                      Respuesta del cliente:
                    </strong>

                    <p className="mb-2 mt-1">
                      {note.clientComment}
                    </p>

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <small className="text-secondary">
                        {note.clientCommentEditable
                          ? 'El cliente puede modificar la respuesta.'
                          : 'La respuesta está bloqueada.'}
                      </small>

                      {!note.clientCommentEditable && (
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                          disabled={
                            commentEditingId ===
                            note.id
                          }
                          onClick={() =>
                            handleCommentEditing(
                              note,
                            )
                          }
                        >
                          {commentEditingId ===
                          note.id
                            ? 'Habilitando...'
                            : 'Habilitar edición'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <Link
                    to={`/admin/clients/${clientId}/progress/${note.id}/edit`}
                    className="btn btn-outline-dark btn-sm"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
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
    </section>
  )
}

export default AdminClientProgressSection

