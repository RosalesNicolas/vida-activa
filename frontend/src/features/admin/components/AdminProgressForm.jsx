import { useState } from 'react'
import { Link } from 'react-router-dom'

const initialFormData = {
  date: '',
  title: '',
  comment: '',
  status: 'en_proceso',
  nextAction: '',
  visibleToClient: true,
}

function AdminProgressForm({
  onSubmit,
  saving = false,
  error = '',
  cancelTo,
  submitText = 'Guardar nota',
}) {
  const [formData, setFormData] =
    useState(initialFormData)

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setFormData((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSubmit({
      ...formData,
      nextAction:
        formData.nextAction || null,
    })
  }

  return (
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

        <div className="col-md-6">
          <label
            htmlFor="status"
            className="form-label"
          >
            Estado
          </label>

          <select
            id="status"
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="positivo">
              Positivo
            </option>

            <option value="en_proceso">
              En proceso
            </option>

            <option value="requiere_atencion">
              Requiere atención
            </option>

            <option value="finalizado">
              Finalizado
            </option>
          </select>
        </div>

        <div className="col-12">
          <label
            htmlFor="title"
            className="form-label"
          >
            Título
          </label>

          <input
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <label
            htmlFor="comment"
            className="form-label"
          >
            Comentario
          </label>

          <textarea
            id="comment"
            name="comment"
            rows="4"
            className="form-control"
            value={formData.comment}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <label
            htmlFor="nextAction"
            className="form-label"
          >
            Próxima acción
          </label>

          <input
            id="nextAction"
            name="nextAction"
            className="form-control"
            value={formData.nextAction}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <div className="form-check">
            <input
              id="visibleToClient"
              name="visibleToClient"
              type="checkbox"
              className="form-check-input"
              checked={
                formData.visibleToClient
              }
              onChange={handleChange}
            />

            <label
              htmlFor="visibleToClient"
              className="form-check-label"
            >
              Visible para el cliente
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Link
          to={cancelTo}
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
            : submitText}
        </button>
      </div>
    </form>
  )
}

export default AdminProgressForm