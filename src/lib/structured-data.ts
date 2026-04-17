import {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  BUSINESS_URL,
  BUSINESS_HOURS,
} from './business-info'

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Locksmith',
    name: BUSINESS_NAME,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    url: BUSINESS_URL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.city,
      addressRegion: BUSINESS_ADDRESS.state,
      postalCode: BUSINESS_ADDRESS.zip,
      addressCountry: BUSINESS_ADDRESS.country,
    },
    openingHours: BUSINESS_HOURS,
    priceRange: '$$',
    areaServed: [
      { '@type': 'City', name: 'Williamsburg, VA' },
      { '@type': 'City', name: 'Toano, VA' },
      { '@type': 'AdministrativeArea', name: 'James City County, VA' },
    ],
  }
}
