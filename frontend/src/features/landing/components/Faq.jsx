import SectionTitle from '../../../components/ui/SectionTitle'
import FaqItem from '../../../components/ui/FaqItem'

const questions = [
  {
    id: 'faq-principiante',
    question: '¿Puedo empezar si nunca entrené?',
    answer:
      'Sí. La planificación se adapta al nivel inicial de cada persona, teniendo en cuenta experiencia previa, objetivos y disponibilidad.',
  },
  {
    id: 'faq-online',
    question: '¿El seguimiento puede ser online?',
    answer:
      'Sí. La propuesta contempla modalidad online y presencial, según lo que mejor se adapte a cada persona.',
  },
  {
    id: 'faq-personalizado',
    question: '¿Los planes son iguales para todos?',
    answer:
      'No. Cada planificación se arma según el objetivo, nivel actual, disponibilidad semanal y necesidades particulares.',
  },
  {
    id: 'faq-ajustes',
    question: '¿Qué pasa si necesito ajustar la rutina?',
    answer:
      'El seguimiento permite revisar avances, resolver dudas y realizar ajustes cuando sea necesario.',
  },
  {
    id: 'faq-deportistas',
    question: '¿También trabajan con deportistas?',
    answer:
      'Sí. Hay propuestas orientadas a preparación física deportiva, rendimiento, prevención de lesiones y acondicionamiento general.',
  },
  {
    id: 'faq-consulta',
    question: '¿Cómo consulto por un plan?',
    answer:
      'Podés consultar directamente por WhatsApp o Instagram desde los botones de la página.',
  },
]

function Faq() {
  return (
    <section id="preguntas-frecuentes" className="section-padding watermark-section bg-faq">
      <div className="container">
        <SectionTitle
          eyebrow="Preguntas frecuentes"
          title="Dudas comunes antes de empezar"
          description="Respuestas rápidas para orientar a quienes estén interesados en comenzar un proceso de entrenamiento."
        />

        <div className="accordion mx-auto faq-wrapper">
          {questions.map((item) => (
            <FaqItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Faq
