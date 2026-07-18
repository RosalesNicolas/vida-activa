import SectionTitle from '../../../components/ui/SectionTitle'
import ServiceCard from '../../../components/ui/ServiceCard'
import { createWhatsappUrl } from '../../../config/contactLinks'

const services = [
  {
    number: '01',
    title: 'Plan de entrenamiento personalizado',
    description:
      'Rutinas adaptadas a tus objetivos, nivel actual, experiencia previa y disponibilidad semanal.',
    whatsappMessage:
      'Hola Felipe, quiero consultar por el Plan de entrenamiento personalizado.',
  },
  {
    number: '02',
    title: 'Seguimiento online',
    description:
      'Acompañamiento a distancia para revisar avances, ajustar entrenamientos y mantener la constancia.',
    whatsappMessage:
      'Hola Felipe, quiero consultar por el Seguimiento online.',
  },
  {
    number: '03',
    title: 'Entrenamiento funcional',
    description:
      'Sesiones orientadas a mejorar fuerza, movilidad, resistencia y condición física general.',
    whatsappMessage:
      'Hola Felipe, quiero consultar por Entrenamiento funcional.',
  },
  {
    number: '04',
    title: 'Preparación física para deportistas',
    description:
      'Trabajo específico para mejorar rendimiento, potencia, resistencia y prevención de lesiones.',
    whatsappMessage:
      'Hola Felipe, quiero consultar por Preparación física para deportistas.',
  },
]

function Services() {
  return (
    <section id="servicios" className="section-padding watermark-section bg-services">
      <div className="container">
        <SectionTitle
          eyebrow="Servicios"
          title="Propuestas de entrenamiento"
          description="Opciones pensadas para distintos objetivos, niveles y modalidades de trabajo."
        />

        <div className="row g-4">
          {services.map((service) => (
            <div className="col-md-6 col-lg-3" key={service.title}>
              <ServiceCard
                number={service.number}
                title={service.title}
                description={service.description}
                ctaHref={createWhatsappUrl(service.whatsappMessage)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
