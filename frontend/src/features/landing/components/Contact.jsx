import {
  INSTAGRAM_URL,
  createWhatsappUrl,
} from '../../../config/contactLinks'

const contactMessage =
  'Hola Felipe, quiero recibir una orientación inicial para empezar a entrenar.'

function Contact() {
  return (
    <section id="contacto" className="contact-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <p className="section-eyebrow text-start">Contacto</p>

            <h2 className="section-title text-light">
              Empezá tu proceso de entrenamiento.
            </h2>

            <p className="contact-description text-start">
              Consultá por el plan que mejor se adapte a tu objetivo y recibí una orientación inicial para comenzar de manera organizada.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
              <a
                href={createWhatsappUrl(contactMessage)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                Hablar por WhatsApp
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-instagram btn-lg"
              >
                Ir a Instagram
              </a>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="row g-4">
              <div className="col-md-6">
                <article className="contact-card h-100">
                  <h3 className="h5 fw-bold">Consulta inicial</h3>
                  <p className="mb-0">
                    Contá tu objetivo, tu disponibilidad y tu experiencia previa para recibir una primera orientación.
                  </p>
                </article>
              </div>

              <div className="col-md-6">
                <article className="contact-card h-100">
                  <h3 className="h5 fw-bold">Seguimiento cercano</h3>
                  <p className="mb-0">
                    Coordiná la modalidad que mejor se adapte a tu rutina: presencial, online o preparación física deportiva.
                  </p>
                </article>
              </div>

              <div className="col-12">
                <article className="contact-card contact-card-highlight">
                  <h3 className="h5 fw-bold">Contacto directo</h3>
                  <p className="mb-0">
                    WhatsApp: +54 9 3516 65-3800 · Instagram: @feliiferrer
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
