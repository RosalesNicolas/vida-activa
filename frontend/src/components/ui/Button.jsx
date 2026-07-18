import logo from '../../assets/logo.jpg'

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top site-navbar">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#inicio">
          <img
            src={logo}
            alt="Logo Vida Activa"
            className="navbar-logo"
          />
          <span>Vida Activa</span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item">
              <a className="nav-link" href="#inicio">Inicio</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#servicios">Servicios</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#metodo">Método</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#modalidades">Modalidades</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#testimonios">Testimonios</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#contacto">Contacto</a>
            </li>

            <li className="nav-item ms-lg-3">
              <a className="btn btn-primary btn-sm px-3" href="#contacto">
                Consultar
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

