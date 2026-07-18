function TestimonialCard({ text, name, goal }) {
  return (
    <article className="card h-100 border-0 shadow-sm testimonial-card">
      <div className="card-body p-4 d-flex flex-column">
        <p className="testimonial-text flex-grow-1">“{text}”</p>

        <div className="mt-3">
          <p className="fw-bold mb-1">{name}</p>
          <p className="text-secondary small mb-0">{goal}</p>
        </div>
      </div>
    </article>
  )
}

export default TestimonialCard
