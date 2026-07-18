import logo from '../../assets/logo.jpg'
import {
  INSTAGRAM_URL,
  WHATSAPP_URL,
} from '../../config/contactLinks'

function Footer() {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row g-4 align-items-start">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src={logo}
                alt="Logo Vida Activa"
                className="footer-logo"
              />

              <div>
                <h5 className="mb-0">Vida Activa</h5>
                <p className="mb-0 text-secondary small">
                  Felipe Ferrer
                </p>
              </div>
            </div>

            <p className="footer-description">
              Entrenamiento personalizado presencial y online para mejorar tu condición física, rendimiento y bienestar general.
            </p>
          </div>

          <div className="col-md-2">
            <h6 className="footer-title">Secciones</h6>

            <ul className="footer-links">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#servicios">Servicios</a></li>
              <li><a href="#metodo">Método</a></li>
              <li><a href="#modalidades">Modalidades</a></li>
              <li><a href="#testimonios">Testimonios</a></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h6 className="footer-title">Contacto</h6>

            <ul className="footer-links">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </li>

              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </li>

              <li>
                <a href="#preguntas-frecuentes">
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-3">
            <h6 className="footer-title">Consulta inicial</h6>

            <p className="footer-description">
              Contá tu objetivo y recibí una primera orientación para elegir la modalidad más adecuada.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp btn-sm"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 footer-bottom">
          <p className="mb-0">
            © 2026 - Vida Activa. Todos los derechos reservados.
          </p>

          <p className="mb-0">
            Proyecto web desarrollado como práctica profesional y académica.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
