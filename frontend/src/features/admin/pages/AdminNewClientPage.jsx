import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'
import { createClient } from '../../../services/clientService'

const initialForm = {
  name: '',
  email: '',
  password: '',
  startDate: '',
}

function AdminNewClientPage() {
  const navigate = useNavigate()

  const [formData, setFormData] =
    useState(initialForm)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const data = await createClient({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        startDate: formData.startDate || null,
      })

      const createdClient =
        data.client ?? data

      if (createdClient?.id) {
        navigate(
          `/admin/clients/${createdClient.id}`,
          {
            replace: true,
          },
        )

        return
      }

      navigate('/admin/clients', {
        replace: true,
      })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo crear el cliente',
      )
    } finally {
      setSaving(false)
    }
  }

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
          Nuevo cliente
        </h1>

        <p className="text-secondary">
          Creá la cuenta inicial. El cliente
          podrá completar sus datos desde su
          perfil.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card border-0 shadow-sm p-4"
      >
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="row g-3">
          <div className="col-md-6">
            <label
              htmlFor="name"
              className="form-label"
            >
              Nombre completo
            </label>

            <input
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="email"
              className="form-label"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="password"
              className="form-label"
            >
              Contraseña inicial
            </label>

            <input
              id="password"
              name="password"
              type="password"
              minLength="8"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="form-text">
              Debe contener al menos 8 caracteres.
            </div>
          </div>

          <div className="col-md-6">
            <label
              htmlFor="startDate"
              className="form-label"
            >
              Fecha de inicio
              <span className="text-secondary">
                {' '}(opcional)
              </span>
            </label>

            <input
              id="startDate"
              name="startDate"
              type="date"
              className="form-control"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link
            to="/admin/clients"
            className="btn btn-outline-secondary"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="btn btn-dark"
            disabled={saving}
          >
            {saving
              ? 'Creando...'
              : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </>
  )
}

export default AdminNewClientPage
