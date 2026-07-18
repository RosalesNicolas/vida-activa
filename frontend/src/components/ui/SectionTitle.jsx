function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="text-center mb-5">
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}

export default SectionTitle
