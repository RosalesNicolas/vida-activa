import { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginForm({
  onSubmit,
  loading,
  error,
  message,
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card border-0 shadow p-4"
    >
      <h1 className="h3 fw-bold mb-2">Ingresar</h1>

      <p className="text-secondary mb-4">
        Accedé al panel de Vida Activa.
      </p>

      {message && (
        <div className="alert alert-warning" role="alert">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>

        <input
          id="password"
          name="password"
          type="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="text-end mb-4">
        <Link
          to="/forgot-password"
          className="small text-decoration-none"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

export default LoginForm
