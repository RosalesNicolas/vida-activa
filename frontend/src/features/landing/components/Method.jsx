import SectionTitle from '../../../components/ui/SectionTitle'
import StepCard from '../../../components/ui/StepCard'
import { createWhatsappUrl } from '../../../config/contactLinks'

const steps = [
  {
    number: '01',
    title: 'Consulta inicial',
    description:
      'La persona se comunica por WhatsApp o Instagram para contar su objetivo, dudas y situación actual.',
  },
  {
    number: '02',
    title: 'Evaluación del objetivo',
    description:
      'Se analiza el punto de partida, experiencia previa, disponibilidad semanal y necesidades específicas.',
  },
  {
    number: '03',
    title: 'Planificación personalizada',
    description:
      'Se arma una propuesta de entrenamiento adaptada al objetivo, nivel y modalidad elegida.',
  },
  {
    number: '04',
    title: 'Seguimiento y ajustes',
    description:
      'Se revisa la evolución, se corrigen detalles y se ajusta el plan según el progreso.',
  },
]

const startMessage =
  'Hola Felipe, quiero empezar mi proceso de entrenamiento.'

function Method() {
  return (
    <section id="metodo" className="section-padding watermark-section bg-method">
      <div className="container">
        <SectionTitle
          eyebrow="Método"
          title="Cómo es el proceso de trabajo"
          description="Un camino simple para empezar, sostener el entrenamiento y medir avances."
        />

        <div className="row g-4">
          {steps.map((step) => (
            <div className="col-md-6 col-lg-3" key={step.number}>
              <StepCard
                number={step.number}
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <a
            href={createWhatsappUrl(startMessage)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp btn-lg px-4"
          >
            Quiero empezar
          </a>
        </div>
      </div>
    </section>
  )
}

export default Method
