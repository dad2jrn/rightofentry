const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

export const withBase = (path: string): string => {
  if (!path) {
    return import.meta.env.BASE_URL
  }

  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path
  }

  const [pathname, hash] = path.split('#')
  const base = trimTrailingSlash(import.meta.env.BASE_URL || '/')
  const normalizedPath = pathname ? ensureLeadingSlash(pathname) : ''

  if (!normalizedPath || normalizedPath === '/') {
    return hash ? `${base}/#${hash}` : `${base}/`
  }

  return `${base}${normalizedPath}${hash ? `#${hash}` : ''}`
}
