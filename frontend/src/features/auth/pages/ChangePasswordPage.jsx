import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { changePasswordRequest } from '../../../services/authService'

function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const returnPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : '/client/profile'

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.newPassword.length < 8) {
      setError(
        'La nueva contraseña debe tener al menos 8 caracteres.',
      )
      return
    }

    if (
      formData.newPassword !==
      formData.confirmNewPassword
    ) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    try {
      setSaving(true)
      setError('')

      await changePasswordRequest(formData)

      window.alert(
        'Contraseña actualizada. Iniciá sesión nuevamente.',
      )

      logout()
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo actualizar la contraseña',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to={returnPath}
          className="text-decoration-none"
        >
          ← Volver
        </Link>

        <h1 className="h3 fw-bold mt-3">
          Cambiar contraseña
        </h1>

        <p className="text-secondary mb-0">
          Ingresá tu contraseña actual y elegí una nueva.
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
          <div className="col-12">
            <label
              htmlFor="currentPassword"
              className="form-label"
            >
              Contraseña actual
            </label>

            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              className="form-control"
              value={formData.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="newPassword"
              className="form-label"
            >
              Nueva contraseña
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength="8"
              className="form-control"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <div className="form-text">
              Mínimo 8 caracteres.
            </div>
          </div>

          <div className="col-md-6">
            <label
              htmlFor="confirmNewPassword"
              className="form-label"
            >
              Confirmar nueva contraseña
            </label>

            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              minLength="8"
              className="form-control"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link
            to={returnPath}
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
              ? 'Actualizando...'
              : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </>
  )
}

export default ChangePasswordPage

