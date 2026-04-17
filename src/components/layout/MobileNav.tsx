import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '../../lib/cn'

type NavLink = {
  href: string
  label: string
}

type MobileNavProps = {
  businessName: string
  phone: string
  phoneHref: string
  links: readonly NavLink[]
  pathname: string
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function MobileNav({
  businessName,
  phone,
  phoneHref,
  links,
  pathname,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) {
      document.documentElement.classList.remove('mobile-nav-open')
      previousActiveElementRef.current?.focus()
      return
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('mobile-nav-open')

    const overlay = overlayRef.current
    const focusableElements = overlay
      ? Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : []

    focusableElements[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (event.key !== 'Tab' || focusableElements.length === 0) {
        return
      }

      const activeIndex = focusableElements.findIndex((element) => element === document.activeElement)
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement || activeIndex === -1) {
          event.preventDefault()
          lastElement?.focus()
        }
        return
      }

      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.classList.remove('mobile-nav-open')
    }
  }, [isOpen])

  const closeMenu = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-overlay"
        aria-haspopup="dialog"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="inline-flex h-12 w-12 items-center justify-center rounded-sharp border border-line bg-surface text-ink transition-colors duration-200 hover:border-ink-soft hover:text-ink-soft"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id="mobile-nav-overlay"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[60] flex min-h-dvh origin-top flex-col bg-ink px-4 pb-8 pt-4 text-paper"
          >
            <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-1 flex-col">
              <div className="flex items-start justify-between gap-6 border-b border-paper-15 pb-5">
                <div className="flex flex-col gap-2">
                  <p
                    id={titleId}
                    className="text-11 font-medium uppercase tracking-caps-3 text-paper-60"
                  >
                    Navigation
                  </p>
                  <p className="text-15 font-semibold tracking-logo text-paper">{businessName}</p>
                </div>

                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-sharp border border-paper-15 text-paper transition-colors duration-200 hover:border-paper hover:text-paper-60"
                  onClick={closeMenu}
                >
                  <X className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>

              <nav className="flex flex-1 items-center justify-center" aria-label="Mobile primary">
                <ul className="flex w-full max-w-sm flex-col items-start gap-6">
                  {links.map(({ href, label }) => (
                    <li key={href} className="w-full border-b border-paper-15 pb-6 last:border-b-0 last:pb-0">
                      <a
                        href={href}
                        aria-current={isActiveLink(href) ? 'page' : undefined}
                        className={cn(
                          'block text-32 font-display leading-tight tracking-h2-sm text-paper transition-colors duration-200 hover:text-paper-60',
                          isActiveLink(href) && 'text-accent',
                        )}
                        onClick={closeMenu}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-paper-15 pt-6">
                <a
                  href={phoneHref}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-sharp bg-accent px-6 py-4 text-13 font-medium tracking-button text-paper transition-colors duration-200 hover:bg-accent-dark"
                  aria-label={`Call ${businessName} at ${phone}`}
                  onClick={closeMenu}
                >
                  <Phone className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                  <span>Call Now {phone}</span>
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
