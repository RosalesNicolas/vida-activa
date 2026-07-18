import heroImage from '../../../assets/hero-felipe.jpg'
import { WHATSAPP_URL } from '../../../config/contactLinks'

function Hero() {
  return (
    <section id="inicio" className="hero-section">
      <div className="container">
        <div className="row align-items-center min-vh-100 py-5">
          <div className="col-lg-6">
            <p className="section-eyebrow text-start">
              Felipe Ferrer - Preparador físico
            </p>

            <h1 className="hero-title">
              Entrenamiento personalizado para construir tu mejor versión.
            </h1>

            <p className="hero-description">
              Acompañamiento presencial y online para mejorar tu rendimiento,
              tu condición física y tu bienestar general.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                Consultar por WhatsApp
              </a>

              <a href="#servicios" className="btn btn-outline-light btn-lg">
                Ver servicios
              </a>
            </div>
          </div>

          <div className="col-lg-6 mt-5 mt-lg-0">
            <div className="hero-image-wrapper">
              <img
                src={heroImage}
                alt="Felipe Ferrer - entrenamiento personalizado"
                className="img-fluid hero-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
