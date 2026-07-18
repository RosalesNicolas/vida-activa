import SectionTitle from '../../../components/ui/SectionTitle'
import PlanCard from '../../../components/ui/PlanCard'
import { createWhatsappUrl } from '../../../config/contactLinks'

const plans = [
  {
    title: 'Entrenamiento presencial',
    description:
      'Para personas que buscan acompañamiento directo, corrección técnica y una guía cercana durante sus entrenamientos.',
    whatsappMessage:
      'Hola Felipe, quiero consultar por la modalidad de entrenamiento presencial.',
  },
  {
    title: 'Seguimiento online',
    description:
      'Para quienes necesitan una planificación personalizada, seguimiento a distancia y ajustes según su evolución.',
    whatsappMessage:
      'Hola Felipe, quiero consultar por la modalidad de seguimiento online.',
  },
  {
    title: 'Preparación física deportiva',
    description:
      'Para deportistas que buscan mejorar su rendimiento físico, prevenir lesiones y entrenar de manera más específica.',
    whatsappMessage:
      'Hola Felipe, quiero consultar por la preparación física deportiva.',
  },
]

function Plans() {
  return (
    <section id="modalidades" className="section-padding watermark-section bg-modalities">
      <div className="container">
        <SectionTitle
          eyebrow="Modalidades"
          title="Elegí cómo querés entrenar"
          description="Las propuestas se adaptan al objetivo, nivel y disponibilidad de cada persona. Los precios se consultan directamente."
        />

        <div className="row g-4 justify-content-center">
          {plans.map((plan) => (
            <div className="col-md-6 col-lg-4" key={plan.title}>
              <PlanCard
                title={plan.title}
                description={plan.description}
                ctaHref={createWhatsappUrl(plan.whatsappMessage)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Plans
