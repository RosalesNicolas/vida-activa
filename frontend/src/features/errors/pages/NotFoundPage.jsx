import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'

function NotFoundPage() {
  const { user } = useAuth()

  const returnPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'client'
        ? '/client/dashboard'
        : '/'

  const returnText = user
    ? 'Volver al panel'
    : 'Volver al inicio'

  return (
    <main className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card border-0 shadow-sm p-5 text-center">
              <span className="display-1 fw-bold">404</span>

              <h1 className="h3 fw-bold mt-3">
                Página no encontrada
              </h1>

              <p className="text-secondary">
                La dirección ingresada no existe o fue modificada.
              </p>

              <Link
                to={returnPath}
                className="btn btn-dark mt-2"
              >
                {returnText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage
