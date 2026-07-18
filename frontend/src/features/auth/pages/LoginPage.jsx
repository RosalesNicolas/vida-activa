import { useState } from 'react'
import {
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import { useAuth } from '../../../context/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sessionMessage =
    searchParams.get('reason') === 'inactivity'
      ? 'La sesión se cerró por inactividad. Iniciá sesión nuevamente.'
      : ''

  if (user) {
    const destination =
      user.role === 'admin'
        ? '/admin/dashboard'
        : '/client/dashboard'

    return <Navigate to={destination} replace />
  }

  const handleLogin = async (credentials) => {
    try {
      setLoading(true)
      setError('')

      const loggedUser = await login(credentials)

      const destination =
        loggedUser.role === 'admin'
          ? '/admin/dashboard'
          : '/client/dashboard'

      navigate(destination, { replace: true })
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'No se pudo iniciar sesión'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-8 col-lg-5">
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
              message={sessionMessage}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
