import { useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { createProgress } from '../../../services/progressService'
import AdminProgressForm from '../components/AdminProgressForm'

function AdminNewProgressPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const handleSubmit = async (
    progressData,
  ) => {
    try {
      setSaving(true)
      setError('')

      await createProgress({
        clientId: Number(id),
        ...progressData,
      })

      navigate(`/admin/clients/${id}`, {
        replace: true,
      })
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'No se pudo crear la nota',
      )
    } finally {
      setSaving(false)
    }
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
          Nueva nota de seguimiento
        </h1>
      </div>

      <AdminProgressForm
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
        cancelTo={`/admin/clients/${id}`}
      />
    </>
  )
}

export default AdminNewProgressPage