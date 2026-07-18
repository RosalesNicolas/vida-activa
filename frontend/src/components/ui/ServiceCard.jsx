function ServiceCard({ number, title, description, ctaHref }) {
  return (
    <article className="card h-100 shadow-sm border-0 service-card">
      <div className="card-body p-4 d-flex flex-column">
        <div className="service-number">{number}</div>

        <h3 className="h5 fw-bold mb-3">{title}</h3>

        <p className="text-secondary flex-grow-1">{description}</p>

        <a
          href={ctaHref}
          target="_blank"
          rel="noreferrer"
          className="btn btn-whatsapp mt-3"
        >
          Consultar
        </a>
      </div>
    </article>
  )
}

export default ServiceCard
