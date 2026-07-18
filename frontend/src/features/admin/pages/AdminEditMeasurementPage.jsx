import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  getMeasurementById,
  updateMeasurement,
} from '../../../services/measurementService'

const numericFields = [
  ['weight', 'Peso', 'kg'],
  ['waist', 'Cintura', 'cm'],
  ['hip', 'Cadera', 'cm'],
  ['chest', 'Pecho', 'cm'],
  ['arm', 'Brazo', 'cm'],
  ['leg', 'Pierna', 'cm'],
  ['bodyFatPercentage', 'Grasa corporal', '%'],
]

function AdminEditMeasurementPage() {
  const { id, measurementId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMeasurement() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getMeasurementById(measurementId)

        const measurement =
          data.measurement ?? data

        setFormData({
          date: measurement.date ?? '',
          weight: measurement.weight ?? '',
          waist: measurement.waist ?? '',
          hip: measurement.hip ?? '',
          chest: measurement.chest ?? '',
          arm: measurement.arm ?? '',
          leg: measurement.leg ?? '',
          bodyFatPercentage:
            measurement.bodyFatPercentage ?? '',
          notes: measurement.notes ?? '',
        })
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'No se pudo cargar la medición',
        )
      } finally {
        setLoading(false)
      }
    }

    loadMeasurement()
  }, [measurementId])

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
      setSaving(true)
      setError('')

      await updateMeasurement(measurementId, {
        date: formData.date,
        weight: Number(formData.weight),
        waist: Number(formData.waist),
        hip: Number(formData.hip),
        chest: Number(formData.chest),
        arm: Number(formData.arm),
        leg: Number(formData.leg),
        bodyFatPercentage: Number(
          formData.bodyFatPercentage,
        ),
        notes: formData.notes.trim() || null,
      })

      navigate(`/admin/clients/${id}`, {
        replace: true,
      })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo actualizar la medición',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Cargando medición...</p>
  }

  if (!formData) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to={`/admin/clients/${id}`}
          className="text-decoration-none"
        >
          ← Volver al perfil
        </Link>

        <h1 className="h3 fw-bold mt-3">
          Editar medición
        </h1>
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
              htmlFor="date"
              className="form-label"
            >
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

          {numericFields.map(
            ([name, label, unit]) => (
              <div
                className="col-md-6"
                key={name}
              >
                <label
                  htmlFor={name}
                  className="form-label"
                >
                  {label} ({unit})
                </label>

                <input
                  id={name}
                  name={name}
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-control"
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ),
          )}

          <div className="col-12">
            <label
              htmlFor="notes"
              className="form-label"
            >
              Observaciones{' '}
              <span className="text-secondary">
                (opcional)
              </span>
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
            disabled={saving}
          >
            {saving
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </>
  )
}

export default AdminEditMeasurementPage
