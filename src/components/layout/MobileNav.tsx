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
  const [currentHash, setCurrentHash] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash)

    syncHash()
    window.addEventListener('hashchange', syncHash)

    return () => {
      window.removeEventListener('hashchange', syncHash)
    }
  }, [])

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
    const [targetPath, hash = ''] = href.split('#')

    if (!hash) {
      if (targetPath === '/') {
        return pathname === '/' && !currentHash
      }

      return pathname === targetPath || pathname.startsWith(`${targetPath}/`)
    }

    if (targetPath !== pathname) {
      return false
    }

    return currentHash === `#${hash}`
  }

  const isHomeLink = (href: string) => {
    const [targetPath, hash = ''] = href.split('#')

    if (!hash && targetPath === '/') {
      return pathname === '/'
    }

    return false
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
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {isOpen ? (
        <div
          id="mobile-nav-overlay"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[60] flex min-h-dvh flex-col bg-ink px-4 pb-8 pt-4 text-paper motion-safe:animate-[mobile-nav-enter_180ms_ease-out]"
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
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 items-center justify-center" aria-label="Mobile primary">
              <ul className="flex w-full max-w-sm flex-col items-start gap-6">
                {links.map(({ href, label }) => (
                  <li key={href} className="w-full border-b border-paper-15 pb-6 last:border-b-0 last:pb-0">
                    <a
                      href={href}
                      aria-current={(isActiveLink(href) || isHomeLink(href)) ? 'page' : undefined}
                      className={cn(
                        'block text-32 font-display leading-tight tracking-h2-sm text-paper transition-colors duration-200 hover:text-paper-60',
                        (isActiveLink(href) || isHomeLink(href)) && 'text-accent',
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
                className="inline-flex w-full items-center justify-center gap-3 rounded-sharp bg-accent px-6 py-4 text-13 font-medium tracking-button text-ink transition-colors duration-200 hover:bg-accent-dark hover:text-ink"
                onClick={closeMenu}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.45 3.57a2 2 0 0 1-.57 1.72L7.91 10.1a16 16 0 0 0 6 6l1.09-1.08a2 2 0 0 1 1.72-.57l3.57.45A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Call Now {phone}</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
