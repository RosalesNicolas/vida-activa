import { useEffect, useState } from 'react'
import SectionTitle from '../../../components/ui/SectionTitle'
import TestimonialCard from '../../../components/ui/TestimonialCard'

const testimonials = [
  {
    text: 'Empecé sin mucha constancia y con el seguimiento pude ordenar mis entrenamientos. Noté cambios reales en mi energía y en mi forma de entrenar.',
    name: 'Lucía Romero',
    goal: 'Entrenamiento personalizado',
  },
  {
    text: 'La planificación se adaptó muy bien a mis horarios. Me sirvió tener una guía clara y ajustes cuando algo no funcionaba.',
    name: 'Martín Aguirre',
    goal: 'Seguimiento online',
  },
  {
    text: 'Me ayudó a mejorar mi fuerza y mi movilidad sin sentir que estaba haciendo algo imposible para mi nivel.',
    name: 'Camila Torres',
    goal: 'Entrenamiento funcional',
  },
  {
    text: 'Buscaba mejorar mi rendimiento deportivo y el trabajo fue muy específico. Sentí mejoras en potencia, resistencia y recuperación.',
    name: 'Santiago Molina',
    goal: 'Preparación física deportiva',
  },
  {
    text: 'Lo que más valoro es el acompañamiento. No fue solo una rutina, sino un proceso con seguimiento y correcciones.',
    name: 'Valentina Suárez',
    goal: 'Proceso de recomposición corporal',
  },
]

const clonedItemsCount = 3

const carouselItems = [
  ...testimonials.slice(-clonedItemsCount),
  ...testimonials,
  ...testimonials.slice(0, clonedItemsCount),
]

function Testimonials() {
  const [trackIndex, setTrackIndex] = useState(clonedItemsCount)
  const [transitionEnabled, setTransitionEnabled] = useState(true)

  const activeDotIndex =
    ((trackIndex - clonedItemsCount) % testimonials.length + testimonials.length) %
    testimonials.length

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrackIndex((currentIndex) => currentIndex + 1)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const resetWithoutAnimation = (newIndex) => {
    setTransitionEnabled(false)
    setTrackIndex(newIndex)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true)
      })
    })
  }

  const handleTransitionEnd = () => {
    if (trackIndex >= testimonials.length + clonedItemsCount) {
      resetWithoutAnimation(clonedItemsCount)
    }

    if (trackIndex < clonedItemsCount) {
      resetWithoutAnimation(testimonials.length + clonedItemsCount - 1)
    }
  }

  const goToPrevious = () => {
    setTrackIndex((currentIndex) => currentIndex - 1)
  }

  const goToNext = () => {
    setTrackIndex((currentIndex) => currentIndex + 1)
  }

  const goToDot = (index) => {
    setTrackIndex(index + clonedItemsCount)
  }

  return (
    <section id="testimonios" className="section-padding watermark-section bg-testimonials">
      <div className="container">
        <SectionTitle
          eyebrow="Testimonios"
          title="Experiencias de entrenamiento"
          description="Textos provisorios para visualizar la sección. Serán reemplazados por testimonios reales validados por Felipe."
        />

        <div className="testimonial-carousel">
          <div className="testimonial-viewport">
            <div
              className={`testimonial-track ${
                transitionEnabled ? 'testimonial-track-animated' : ''
              }`}
              style={{
                transform: `translateX(calc(-${trackIndex} * (100% / var(--testimonial-items))))`,
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {carouselItems.map((testimonial, index) => (
                <div
                  className="testimonial-slide"
                  key={`${testimonial.name}-${index}`}
                >
                  <TestimonialCard
                    text={testimonial.text}
                    name={testimonial.name}
                    goal={testimonial.goal}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="testimonial-controls">
            <button
              type="button"
              className="testimonial-control-button"
              onClick={goToPrevious}
              aria-label="Ver testimonio anterior"
            >
              Anterior
            </button>

            <div className="testimonial-indicators">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  className={`testimonial-dot ${
                    index === activeDotIndex ? 'testimonial-dot-active' : ''
                  }`}
                  onClick={() => goToDot(index)}
                  aria-label={`Ver testimonio ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="testimonial-control-button"
              onClick={goToNext}
              aria-label="Ver testimonio siguiente"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
