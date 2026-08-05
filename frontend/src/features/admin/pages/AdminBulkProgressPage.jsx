import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { getClients } from '../../../services/clientService'
import { createBulkProgress } from '../../../services/progressService'
import AdminProgressForm from '../components/AdminProgressForm'

async function loadAllActiveClients() {
  const clients = []
  let page = 1
  let totalPages = 1

  do {
    const data = await getClients({
      page,
      limit: 50,
      status: 'active',
    })

    const currentClients =
      data.clients ??
      data.rows ??
      []

    clients.push(...currentClients)

    totalPages =
      data.pagination?.totalPages ?? 1

    page += 1
  } while (page <= totalPages)

  return clients
}

function AdminBulkProgressPage() {
  const navigate = useNavigate()

  const [clients, setClients] =
    useState([])

  const [selectedIds, setSelectedIds] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  useEffect(() => {
    let cancelled = false

    loadAllActiveClients()
      .then((loadedClients) => {
        if (!cancelled) {
          setClients(loadedClients)
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError.response?.data
              ?.message ||
              'No se pudieron cargar los clientes',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredClients = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    if (!normalizedSearch) {
      return clients
    }

    return clients.filter((client) => {
      const user =
        client.user ??
        client.User ??
        {}

      const searchableText =
        `${user.name ?? ''} ${user.email ?? ''}`
          .toLowerCase()

      return searchableText.includes(
        normalizedSearch,
      )
    })
  }, [clients, search])

  const filteredIds = filteredClients.map(
    (client) => client.id,
  )

  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((clientId) =>
      selectedIds.includes(clientId),
    )

  const handleClientToggle = (
    clientId,
  ) => {
    setSelectedIds((current) =>
      current.includes(clientId)
        ? current.filter(
            (id) => id !== clientId,
          )
        : [...current, clientId],
    )
  }

  const handleSelectAll = () => {
    setSelectedIds((current) => {
      if (allFilteredSelected) {
        return current.filter(
          (clientId) =>
            !filteredIds.includes(clientId),
        )
      }

      return [
        ...new Set([
          ...current,
          ...filteredIds,
        ]),
      ]
    })
  }

  const handleSubmit = async (
    progressData,
  ) => {
    if (selectedIds.length === 0) {
      setError(
        'Debés seleccionar al menos un cliente.',
      )

      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const data =
        await createBulkProgress({
          clientIds: selectedIds,
          ...progressData,
        })

      setSuccess(
        data.message ||
          'Los seguimientos se crearon correctamente.',
      )

      navigate('/admin/dashboard', {
        replace: true,
      })
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'No se pudieron crear los seguimientos',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold">
          Nuevo seguimiento múltiple
        </h1>

        <p className="text-secondary mb-0">
          Seleccioná uno o varios clientes y
          enviá el mismo seguimiento.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h2 className="h5 mb-3">
          Destinatarios
        </h2>

        <div className="mb-3">
          <label
            htmlFor="clientSearch"
            className="form-label"
          >
            Buscar cliente
          </label>

          <input
            id="clientSearch"
            type="search"
            className="form-control"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Nombre o email"
          />
        </div>

        {loading ? (
          <p className="mb-0">
            Cargando clientes...
          </p>
        ) : (
          <>
            <div className="form-check mb-3">
              <input
                id="selectAllClients"
                type="checkbox"
                className="form-check-input"
                checked={allFilteredSelected}
                onChange={handleSelectAll}
                disabled={
                  filteredClients.length === 0
                }
              />

              <label
                htmlFor="selectAllClients"
                className="form-check-label fw-semibold"
              >
                Seleccionar todos los visibles
              </label>
            </div>

            <div
              className="border rounded p-3"
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              {filteredClients.length === 0 ? (
                <p className="text-secondary mb-0">
                  No se encontraron clientes.
                </p>
              ) : (
                filteredClients.map(
                  (client) => {
                    const user =
                      client.user ??
                      client.User ??
                      {}

                    return (
                      <div
                        key={client.id}
                        className="form-check py-2 border-bottom"
                      >
                        <input
                          id={`client-${client.id}`}
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(
                            client.id,
                          )}
                          onChange={() =>
                            handleClientToggle(
                              client.id,
                            )
                          }
                        />

                        <label
                          htmlFor={`client-${client.id}`}
                          className="form-check-label"
                        >
                          <span className="fw-semibold">
                            {user.name ||
                              `Cliente ${client.id}`}
                          </span>

                          {user.email && (
                            <span className="text-secondary ms-2">
                              {user.email}
                            </span>
                          )}
                        </label>
                      </div>
                    )
                  },
                )
              )}
            </div>

            <p className="text-secondary mt-3 mb-0">
              {selectedIds.length}{' '}
              {selectedIds.length === 1
                ? 'cliente seleccionado'
                : 'clientes seleccionados'}
            </p>
          </>
        )}
      </div>

      <AdminProgressForm
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
        cancelTo="/admin/dashboard"
        submitText="Crear seguimientos"
      />
    </>
  )
}

export default AdminBulkProgressPage