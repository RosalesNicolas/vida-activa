import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  activateClient,
  deactivateClient,
  getClients,
} from '../../../services/clientService'

const PAGE_SIZE = 10

function AdminClientsPage() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] =
    useState('')
  const [statusFilter, setStatusFilter] =
    useState('all')
  const [page, setPage] = useState(1)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })

  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const searchTimeout = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, 400)

    return () => {
      window.clearTimeout(searchTimeout)
    }
  }, [search])

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getClients({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter,
      })

      setClients(
        Array.isArray(data.clients)
          ? data.clients
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
          'No se pudieron cargar los clientes',
      )
    } finally {
      setLoading(false)
    }
  }, [
    page,
    debouncedSearch,
    statusFilter,
  ])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const handleStatusChange = async (client) => {
    const isActive = Boolean(client.user?.active)

    const confirmed = window.confirm(
      isActive
        ? '¿Desactivar este cliente? No podrá iniciar sesión.'
        : '¿Activar nuevamente este cliente?',
    )

    if (!confirmed) return

    try {
      setActionId(client.id)
      setError('')

      if (isActive) {
        await deactivateClient(client.id)
      } else {
        await activateClient(client.id)
      }

      const clientWillLeaveCurrentFilter =
        statusFilter !== 'all'

      if (
        clientWillLeaveCurrentFilter &&
        clients.length === 1 &&
        page > 1
      ) {
        setPage((currentPage) =>
          Math.max(1, currentPage - 1),
        )
      } else {
        await loadClients()
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo cambiar el estado del cliente',
      )
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold">Clientes</h1>

          <p className="text-secondary mb-0">
            Administración de clientes.
          </p>
        </div>

        <Link
          to="/admin/clients/new"
          className="btn btn-dark"
        >
          Nuevo cliente
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label
                htmlFor="clientSearch"
                className="form-label"
              >
                Buscar
              </label>

              <input
                id="clientSearch"
                type="search"
                className="form-control"
                placeholder="Nombre, email u objetivo"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="col-md-4">
              <label
                htmlFor="statusFilter"
                className="form-label"
              >
                Estado
              </label>

              <select
                id="statusFilter"
                className="form-select"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">
                  Inactivos
                </option>
              </select>
            </div>
          </div>

          <p className="text-secondary small mb-0 mt-3">
            {pagination.total} cliente(s) encontrado(s)
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        {loading ? (
          <p className="p-4 mb-0">
            Cargando clientes...
          </p>
        ) : clients.length === 0 ? (
          <p className="p-4 mb-0">
            No hay clientes que coincidan con los
            filtros.
          </p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Nombre</th>
                    <th>Email</th>
                    <th>Objetivo</th>
                    <th>Estado</th>
                    <th className="text-end pe-4">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => {
                    const isActive = Boolean(
                      client.user?.active,
                    )

                    const isProcessing =
                      actionId === client.id

                    return (
                      <tr key={client.id}>
                        <td className="ps-4">
                          {client.user?.name ||
                            'Sin nombre'}
                        </td>

                        <td>
                          {client.user?.email ||
                            'Sin email'}
                        </td>

                        <td>
                          {client.objective ||
                            'Sin definir'}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              isActive
                                ? 'text-bg-success'
                                : 'text-bg-secondary'
                            }`}
                          >
                            {isActive
                              ? 'Activo'
                              : 'Inactivo'}
                          </span>
                        </td>

                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <Link
                              to={`/admin/clients/${client.id}`}
                              className="btn btn-outline-dark btn-sm"
                            >
                              Ver perfil
                            </Link>

                            <button
                              type="button"
                              className={`btn btn-sm ${
                                isActive
                                  ? 'btn-outline-danger'
                                  : 'btn-outline-success'
                              }`}
                              disabled={isProcessing}
                              onClick={() =>
                                handleStatusChange(
                                  client,
                                )
                              }
                            >
                              {isProcessing
                                ? 'Procesando...'
                                : isActive
                                  ? 'Desactivar'
                                  : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
                  setPage((currentPage) =>
                    Math.max(
                      1,
                      currentPage - 1,
                    ),
                  )
                }
              >
                Anterior
              </button>

              <span className="text-secondary small">
                Página {pagination.page} de{' '}
                {pagination.totalPages}
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
                  setPage((currentPage) =>
                    Math.min(
                      pagination.totalPages,
                      currentPage + 1,
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
    </>
  )
}

export default AdminClientsPage
