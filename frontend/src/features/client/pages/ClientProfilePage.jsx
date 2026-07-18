import { useEffect, useState } from 'react'
import {
  getMyClientProfile,
  updateMyClientProfile,
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
}

function calculateAge(birthDate) {
  if (!birthDate) return null

  const today = new Date()
  const birth = new Date(`${birthDate}T00:00:00`)

  let age =
    today.getFullYear() - birth.getFullYear()

  const monthDifference =
    today.getMonth() - birth.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age -= 1
  }

  return age >= 0 ? age : null
}

function formatSex(value) {
  const labels = {
    female: 'Femenino',
    male: 'Masculino',
    other: 'Otro',
    preferNotToSay: 'Prefiero no decirlo',
  }

  return labels[value] || 'Sin definir'
}

function ClientProfilePage() {
  const [client, setClient] = useState(null)
  const [formData, setFormData] =
    useState(emptyForm)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getMyClientProfile()
      const loadedClient = data.client ?? data
      const user =
        loadedClient.user ??
        loadedClient.User ??
        {}

      setClient(loadedClient)

      setFormData({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: loadedClient.phone ?? '',
        birthDate: loadedClient.birthDate ?? '',
        sex: loadedClient.sex ?? '',
        address: loadedClient.address ?? '',
        occupation: loadedClient.occupation ?? '',
        height: loadedClient.height ?? '',
        objective: loadedClient.objective ?? '',
        injuries: loadedClient.injuries ?? '',
        diseases: loadedClient.diseases ?? '',
        medications:
          loadedClient.medications ?? '',
        emergencyContactName:
          loadedClient.emergencyContactName ?? '',
        emergencyContactPhone:
          loadedClient.emergencyContactPhone ?? '',
        observations:
          loadedClient.observations ?? '',
      })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo cargar tu perfil',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    const user =
      client.user ??
      client.User ??
      {}

    setFormData({
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
      observations: client.observations ?? '',
    })

    setError('')
    setSuccess('')
    setEditing(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await updateMyClientProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate || null,
        sex: formData.sex,
        address: formData.address.trim(),
        occupation: formData.occupation.trim(),
        height: formData.height,
        objective: formData.objective.trim(),
        injuries: formData.injuries.trim(),
        diseases: formData.diseases.trim(),
        medications: formData.medications.trim(),
        emergencyContactName:
          formData.emergencyContactName.trim(),
        emergencyContactPhone:
          formData.emergencyContactPhone.trim(),
        observations:
          formData.observations.trim(),
      })

      await loadProfile()

      setEditing(false)
      setSuccess(
        'Tus datos se actualizaron correctamente.',
      )
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'No se pudo actualizar tu perfil',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Cargando perfil...</p>
  }

  if (!client) {
    return (
      <div className="alert alert-danger">
        {error || 'No se encontró tu perfil.'}
      </div>
    )
  }

  const user =
    client.user ??
    client.User ??
    {}

  const age = calculateAge(client.birthDate)

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold">
            Mi perfil
          </h1>

          <p className="text-secondary mb-0">
            Completá y mantené actualizados tus
            datos personales.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => {
              setError('')
              setSuccess('')
              setEditing(true)
            }}
          >
            Editar mis datos
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="card border-0 shadow-sm p-4"
        >
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
                Si no tenés enfermedades,
                escribí “Ninguna”.
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
                Otras observaciones
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
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-dark"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : 'Guardar datos'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card border-0 shadow-sm p-4">
          <h2 className="h5 mb-4">
            Datos personales
          </h2>

          <div className="row g-4">
            <div className="col-md-6">
              <strong>Nombre</strong>
              <p>{user.name || 'Sin definir'}</p>
            </div>

            <div className="col-md-6">
              <strong>Email</strong>
              <p>{user.email || 'Sin definir'}</p>
            </div>

            <div className="col-md-6">
              <strong>Teléfono</strong>
              <p>{client.phone || 'Sin definir'}</p>
            </div>

            <div className="col-md-6">
              <strong>Fecha de nacimiento</strong>
              <p>
                {client.birthDate || 'Sin definir'}
                {age !== null
                  ? ` (${age} años)`
                  : ''}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Sexo</strong>
              <p>{formatSex(client.sex)}</p>
            </div>

            <div className="col-md-6">
              <strong>Altura</strong>
              <p>
                {client.height
                  ? `${client.height} m`
                  : 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Dirección</strong>
              <p>
                {client.address || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Ocupación</strong>
              <p>
                {client.occupation || 'Sin definir'}
              </p>
            </div>

            <div className="col-12">
              <strong>Objetivo</strong>
              <p>
                {client.objective || 'Sin definir'}
              </p>
            </div>
          </div>

          <hr className="my-4" />

          <h2 className="h5 mb-4">
            Información de salud
          </h2>

          <div className="row g-4">
            <div className="col-md-6">
              <strong>Lesiones o limitaciones</strong>
              <p>
                {client.injuries || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Enfermedades</strong>
              <p>
                {client.diseases || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Medicación</strong>
              <p>
                {client.medications || 'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Observaciones</strong>
              <p>
                {client.observations ||
                  'Sin observaciones'}
              </p>
            </div>
          </div>

          <hr className="my-4" />

          <h2 className="h5 mb-4">
            Contacto de emergencia
          </h2>

          <div className="row g-4">
            <div className="col-md-6">
              <strong>Nombre</strong>
              <p>
                {client.emergencyContactName ||
                  'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Teléfono</strong>
              <p>
                {client.emergencyContactPhone ||
                  'Sin definir'}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Fecha de inicio</strong>
              <p>
                {client.startDate || 'Sin definir'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ClientProfilePage
