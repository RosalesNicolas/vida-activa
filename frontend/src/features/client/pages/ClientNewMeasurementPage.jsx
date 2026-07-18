import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createMyMeasurement } from '../../../services/measurementService'

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

const numericFields = [
  ['weight', 'Peso', 'kg'],
  ['waist', 'Cintura', 'cm'],
  ['hip', 'Cadera', 'cm'],
  ['chest', 'Pecho', 'cm'],
  ['arm', 'Brazo', 'cm'],
  ['leg', 'Pierna', 'cm'],
  ['bodyFatPercentage', 'Grasa corporal', '%'],
]

function ClientNewMeasurementPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialForm)
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

      await createMyMeasurement({
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

      navigate('/client/measurements', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo guardar la medición',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to="/client/measurements"
          className="text-decoration-none"
        >
          ← Volver a mediciones
        </Link>

        <h1 className="h3 fw-bold mt-3">Nueva medición</h1>

        <p className="text-secondary">
          Registrá tus medidas actuales.
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
                min="0"
                step="0.1"
                className="form-control"
                value={formData[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="col-12">
            <label htmlFor="notes" className="form-label">
              Observaciones
            </label>

            <textarea
              id="notes"
              name="notes"
              rows="3"
              className="form-control"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link
            to="/client/measurements"
            className="btn btn-outline-secondary"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="btn btn-dark"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar medición'}
          </button>
        </div>
      </form>
    </>
  )
}

export default ClientNewMeasurementPage
