import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  getClientById,
  updateClient,
} from '../../../services/clientService'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  sex: '',
  address: '',
  occupation: '',
  height: '',
  objective: '',
  injuries: '',
  diseases: '',
  medications: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  observations: '',
  startDate: '',
}

function AdminEditClientPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true)
        setError('')

        const data = await getClientById(id)
        const client = data.client ?? data

        const user =
          client.user ??
          client.User ??
          {}

        setFormData({
          ...emptyForm,
          name: user.name ?? '',
          email: user.email ?? '',
          phone: client.phone ?? '',
          birthDate: client.birthDate ?? '',
          sex: client.sex ?? '',
          address: client.address ?? '',
          occupation: client.occupation ?? '',
          height: client.height ?? '',
          objective: client.objective ?? '',
          injuries: client.injuries ?? '',
          diseases: client.diseases ?? '',
          medications: client.medications ?? '',
          emergencyContactName:
            client.emergencyContactName ?? '',
          emergencyContactPhone:
            client.emergencyContactPhone ?? '',
          observations:
            client.observations ?? '',
          startDate: client.startDate ?? '',
        })
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'No se pudo cargar el cliente',
        )
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [id])

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

      await updateClient(id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthDate:
          formData.birthDate || null,
        sex: formData.sex,
        address: formData.address.trim(),
        occupation:
          formData.occupation.trim(),
        height: formData.height,
        objective: formData.objective.trim(),
        injuries: formData.injuries.trim(),
        diseases: formData.diseases.trim(),
        medications:
          formData.medications.trim(),
        emergencyContactName:
          formData.emergencyContactName.trim(),
        emergencyContactPhone:
          formData.emergencyContactPhone.trim(),
        observations:
          formData.observations.trim(),
        startDate:
          formData.startDate || null,
      })

      navigate(`/admin/clients/${id}`, {
        replace: true,
      })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo actualizar el cliente',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Cargando cliente...</p>
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
          Editar datos del cliente
        </h1>

        <p className="text-secondary">
          Felipe puede modificar todos los
          datos del perfil.
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

        <h2 className="h5 mb-4">
          Datos personales
        </h2>

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
              htmlFor="phone"
              className="form-label"
            >
              Teléfono
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="birthDate"
              className="form-label"
            >
              Fecha de nacimiento
            </label>

            <input
              id="birthDate"
              name="birthDate"
              type="date"
              className="form-control"
              value={formData.birthDate}
              onChange={handleChange}
              max={
                new Date()
                  .toISOString()
                  .split('T')[0]
              }
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="sex"
              className="form-label"
            >
              Sexo
            </label>

            <select
              id="sex"
              name="sex"
              className="form-select"
              value={formData.sex}
              onChange={handleChange}
            >
              <option value="">
                Sin especificar
              </option>
              <option value="female">
                Femenino
              </option>
              <option value="male">
                Masculino
              </option>
              <option value="other">
                Otro
              </option>
              <option value="preferNotToSay">
                Prefiero no decirlo
              </option>
            </select>
          </div>

          <div className="col-md-6">
            <label
              htmlFor="height"
              className="form-label"
            >
              Altura (m)
            </label>

            <input
              id="height"
              name="height"
              type="number"
              min="0.5"
              max="3"
              step="0.01"
              className="form-control"
              value={formData.height}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="address"
              className="form-label"
            >
              Dirección
            </label>

            <input
              id="address"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="occupation"
              className="form-label"
            >
              Ocupación
            </label>

            <input
              id="occupation"
              name="occupation"
              className="form-control"
              value={formData.occupation}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="startDate"
              className="form-label"
            >
              Fecha de inicio
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

          <div className="col-12">
            <label
              htmlFor="objective"
              className="form-label"
            >
              Objetivo
            </label>

            <textarea
              id="objective"
              name="objective"
              rows="2"
              className="form-control"
              value={formData.objective}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr className="my-4" />

        <h2 className="h5 mb-4">
          Información de salud
        </h2>

        <div className="row g-3">
          <div className="col-md-6">
            <label
              htmlFor="injuries"
              className="form-label"
            >
              Lesiones o limitaciones
            </label>

            <textarea
              id="injuries"
              name="injuries"
              rows="3"
              className="form-control"
              value={formData.injuries}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="diseases"
              className="form-label"
            >
              Enfermedades
            </label>

            <textarea
              id="diseases"
              name="diseases"
              rows="3"
              className="form-control"
              value={formData.diseases}
              onChange={handleChange}
              required
            />

            <div className="form-text">
              Si no posee enfermedades,
              indicá “Ninguna”.
            </div>
          </div>

          <div className="col-md-6">
            <label
              htmlFor="medications"
              className="form-label"
            >
              Medicación
            </label>

            <textarea
              id="medications"
              name="medications"
              rows="3"
              className="form-control"
              value={formData.medications}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="observations"
              className="form-label"
            >
              Observaciones
            </label>

            <textarea
              id="observations"
              name="observations"
              rows="3"
              className="form-control"
              value={formData.observations}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr className="my-4" />

        <h2 className="h5 mb-4">
          Contacto de emergencia
        </h2>

        <div className="row g-3">
          <div className="col-md-6">
            <label
              htmlFor="emergencyContactName"
              className="form-label"
            >
              Nombre
            </label>

            <input
              id="emergencyContactName"
              name="emergencyContactName"
              className="form-control"
              value={
                formData.emergencyContactName
              }
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label
              htmlFor="emergencyContactPhone"
              className="form-label"
            >
              Teléfono
            </label>

            <input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              className="form-control"
              value={
                formData.emergencyContactPhone
              }
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

export default AdminEditClientPage
