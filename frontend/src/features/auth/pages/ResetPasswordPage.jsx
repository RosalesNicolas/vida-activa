import { useState } from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { resetPasswordRequest } from '../../../services/authService'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') || ''

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  })

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

    if (!token) {
      setError(
        'El enlace de recuperación no contiene un token válido.',
      )
      return
    }

    if (formData.newPassword.length < 8) {
      setError(
        'La contraseña debe tener al menos 8 caracteres.',
      )
      return
    }

    if (
      formData.newPassword !==
      formData.confirmNewPassword
    ) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      setSaving(true)
      setError('')

      await resetPasswordRequest({
        token,
        newPassword: formData.newPassword,
        confirmNewPassword:
          formData.confirmNewPassword,
      })

      window.alert(
        'Contraseña restablecida correctamente.',
      )

      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo restablecer la contraseña',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!token) {
    return (
      <main className="min-vh-100 d-flex align-items-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div className="card border-0 shadow-sm p-4">
                <div className="alert alert-danger">
                  El enlace de recuperación es inválido.
                </div>

                <Link
                  to="/forgot-password"
                  className="btn btn-dark"
                >
                  Solicitar otro enlace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <form
              onSubmit={handleSubmit}
              className="card border-0 shadow-sm p-4"
            >
              <h1 className="h3 fw-bold">
                Nueva contraseña
              </h1>

              <p className="text-secondary">
                Elegí una contraseña nueva para tu cuenta.
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <div className="mb-3">
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

              <div className="mb-4">
                <label
                  htmlFor="confirmNewPassword"
                  className="form-label"
                >
                  Confirmar contraseña
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

              <button
                type="submit"
                className="btn btn-dark"
                disabled={saving}
              >
                {saving
                  ? 'Actualizando...'
                  : 'Restablecer contraseña'}
              </button>

              <Link
                to="/login"
                className="text-center text-decoration-none mt-3"
              >
                Volver al inicio de sesión
              </Link>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ResetPasswordPage
