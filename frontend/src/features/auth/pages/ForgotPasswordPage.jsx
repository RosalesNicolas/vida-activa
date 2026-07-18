import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordRequest } from '../../../services/authService'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [developmentResetUrl, setDevelopmentResetUrl] =
    useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSending(true)
      setMessage('')
      setError('')
      setDevelopmentResetUrl('')

      const data = await forgotPasswordRequest(
        email.trim().toLowerCase(),
      )

      setMessage(
        data.message ||
          'Revisá tu correo para continuar.',
      )

      setDevelopmentResetUrl(
        data.developmentResetUrl || '',
      )
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo procesar la solicitud',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card border-0 shadow-sm p-4">
              <Link
                to="/login"
                className="text-decoration-none mb-3"
              >
                ← Volver al inicio de sesión
              </Link>

              <h1 className="h3 fw-bold">
                Recuperar contraseña
              </h1>

              <p className="text-secondary">
                Ingresá el email asociado a tu cuenta.
              </p>

              {message && (
                <div className="alert alert-success">
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="form-label"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={sending}
                >
                  {sending
                    ? 'Enviando...'
                    : 'Enviar instrucciones'}
                </button>
              </form>

              {developmentResetUrl && (
                <div className="alert alert-warning mt-4 mb-0">
                  <strong>Modo desarrollo</strong>

                  <p className="small mt-2 mb-2">
                    Mientras no esté configurado el correo,
                    usá este enlace:
                  </p>

                  <a
                    href={developmentResetUrl}
                    className="btn btn-outline-dark btn-sm"
                  >
                    Restablecer contraseña
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ForgotPasswordPage

