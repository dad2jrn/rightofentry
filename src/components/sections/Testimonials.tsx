import { useEffect, useRef, useState } from 'react'
import { MapPin, Star } from 'lucide-react'

type Testimonial = {
  id: string
  name: string
  location: string
  service: string
  quote: string
  rating: number
}

type Props = {
  testimonials: Testimonial[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < rating

        return (
          <Star
            key={index}
            aria-hidden="true"
            className={filled ? 'text-accent h-4 w-4 fill-current' : 'text-line h-4 w-4'}
            strokeWidth={1.7}
          />
        )
      })}
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="border-line bg-surface flex h-full min-w-0 snap-center flex-col rounded-[var(--radius-card)] border p-6 md:p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <StarRating rating={testimonial.rating} />
        <p className="text-11 tracking-caps-2 text-accent-dark font-medium uppercase">
          {testimonial.service}
        </p>
      </div>

      <blockquote className="text-18 tracking-h3 text-ink font-display flex-1 italic leading-[1.45]">
        “{testimonial.quote}”
      </blockquote>

      <footer className="border-line mt-6 border-t pt-4">
        <p className="text-15 tracking-logo text-ink font-medium">{testimonial.name}</p>
        <p className="text-13 text-muted mt-1 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={1.8} />
          <span>{testimonial.location}</span>
        </p>
      </footer>
    </article>
  )
}

export function Testimonials({ testimonials }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const updateActiveIndex = () => {
      const cards = Array.from(carousel.children) as HTMLElement[]
      if (!cards.length) return

      const nextIndex = cards.findIndex((card) => {
        const delta = Math.abs(card.offsetLeft - carousel.scrollLeft)
        return delta < card.offsetWidth / 2
      })

      setActiveIndex(nextIndex === -1 ? 0 : nextIndex)
    }

    updateActiveIndex()
    carousel.addEventListener('scroll', updateActiveIndex, { passive: true })

    return () => carousel.removeEventListener('scroll', updateActiveIndex)
  }, [testimonials.length])

  const scrollToCard = (index: number) => {
    const carousel = carouselRef.current
    const target = carousel?.children[index] as HTMLElement | undefined

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  return (
    <section id="testimonials" className="border-line bg-paper border-t">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-16 md:px-8 md:py-20 lg:py-24">
        <header className="mb-12 max-w-3xl">
          <p className="text-11 tracking-caps-3 text-muted mb-3 font-medium uppercase">
            What customers say
          </p>
          <h2 className="text-28 tracking-h2-sm font-display text-ink font-medium">
            Neighbors who&apos;ve called us
          </h2>
        </header>

        <div
          ref={carouselRef}
          className="scroll-px-4 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-[85%] shrink-0 md:w-[48%] lg:w-auto lg:shrink">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 lg:hidden">
          <p className="text-12 tracking-caps-1 text-muted font-medium uppercase">
            Swipe or tap to browse
          </p>

          <div className="flex items-center gap-2" aria-label="Testimonials navigation">
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex

              return (
                <button
                  key={testimonial.id}
                  type="button"
                  onClick={() => scrollToCard(index)}
                  aria-label={`View testimonial ${index + 1}`}
                  aria-pressed={isActive}
                  className={[
                    'border-line h-2.5 rounded-full border transition-[width,background-color] duration-200',
                    isActive ? 'bg-accent w-7' : 'bg-surface w-2.5',
                  ].join(' ')}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
