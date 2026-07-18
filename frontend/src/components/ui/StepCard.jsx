function StepCard({ number, title, description }) {
  return (
    <article className="step-card h-100">
      <div className="step-number">{number}</div>
      <h3 className="h5 fw-bold mt-3">{title}</h3>
      <p className="text-secondary mb-0">{description}</p>
    </article>
  )
}

export default StepCard
