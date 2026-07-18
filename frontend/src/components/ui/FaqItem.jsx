function FaqItem({ id, question, answer }) {
  return (
    <div className="accordion-item">
      <h3 className="accordion-header">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${id}`}
          aria-expanded="false"
          aria-controls={id}
        >
          {question}
        </button>
      </h3>

      <div
        id={id}
        className="accordion-collapse collapse"
      >
        <div className="accordion-body text-secondary">
          {answer}
        </div>
      </div>
    </div>
  )
}

export default FaqItem
