function PlanCard({ title, description, ctaHref }) {
  return (
    <article className="card h-100 border-0 shadow-sm plan-card">
      <div className="card-body p-4 d-flex flex-column">
        <h3 className="h5 fw-bold mb-3">{title}</h3>

        <p className="text-secondary flex-grow-1">{description}</p>

        <a
          href={ctaHref}
          target="_blank"
          rel="noreferrer"
          className="btn btn-whatsapp mt-3"
        >
          Consultar modalidad
        </a>
      </div>
    </article>
  )
}

export default PlanCard
