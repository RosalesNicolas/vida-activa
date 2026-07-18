import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createMeasurement } from '../../../services/measurementService'

const initialForm = {
  date: '',
  weight: '',
  waist: '',
  hip: '',
  chest: '',
  arm: '',
  leg: '',
  bodyFatPercentage: '',
  notes: '',
}

function AdminNewMeasurementPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      await createMeasurement({
        clientId: Number(id),
        date: formData.date,
        weight: Number(formData.weight),
        waist: Number(formData.waist),
        hip: Number(formData.hip),
        chest: Number(formData.chest),
        arm: Number(formData.arm),
        leg: Number(formData.leg),
        bodyFatPercentage: Number(formData.bodyFatPercentage),
        notes: formData.notes.trim() || null,
      })

      navigate(`/admin/clients/${id}`, { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo crear la medición',
      )
    } finally {
      setLoading(false)
    }
  }

  const numericFields = [
    ['weight', 'Peso', 'kg'],
    ['waist', 'Cintura', 'cm'],
    ['hip', 'Cadera', 'cm'],
    ['chest', 'Pecho', 'cm'],
    ['arm', 'Brazo', 'cm'],
    ['leg', 'Pierna', 'cm'],
    ['bodyFatPercentage', 'Grasa corporal', '%'],
  ]

  return (
    <>
      <div className="mb-4">
        <Link
          to={`/admin/clients/${id}`}
          className="text-decoration-none"
        >
          ← Volver al perfil
        </Link>

        <h1 className="h3 fw-bold mt-3">Nueva medición</h1>
        <p className="text-secondary">
          Registrá las medidas físicas del cliente.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card border-0 shadow-sm p-4"
      >
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="date" className="form-label">
              Fecha
            </label>

            <input
              id="date"
              name="date"
              type="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {numericFields.map(([name, label, unit]) => (
            <div className="col-md-6" key={name}>
              <label htmlFor={name} className="form-label">
                {label} ({unit})
              </label>

              <input
                id={name}
                name={name}
                type="number"
                step="0.1"
                min="0"
                className="form-control"
                value={formData[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="col-12">
            <label htmlFor="notes" className="form-label">
              Observaciones (opcional)
            </label>

            <textarea
              id="notes"
              name="notes"
              className="form-control"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link
            to={`/admin/clients/${id}`}
            className="btn btn-outline-secondary"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="btn btn-dark"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar medición'}
          </button>
        </div>
      </form>
    </>
  )
}

export default AdminNewMeasurementPage

