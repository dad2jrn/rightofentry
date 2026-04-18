import servicesData from '../content/services.json'
import pricingData from '../content/pricing.json'

export type IconName =
  | 'locked-door'
  | 'cylinder-key'
  | 'deadbolt'
  | 'key-fob'
  | 'keypad-entry'
  | 'clipboard-shield'

type BaseService = {
  slug: string
  title: string
  shortDescription: string
  longDescription: string[]
  icon: IconName
  href: string
  order: number
  featured: boolean
  offered: boolean
}

type PricingMode = 'starting-at' | 'range'

type ServiceModifier = {
  id: string
  label: string
  display: string
  amount: number
  appliesTo: string[]
}

type ServicePricingRecord = {
  slug: string
  mode: PricingMode
  display: string
  startingAt?: number
  minimum?: number
  maximum?: number
  modifiers: string[]
}

type PricingCatalog = {
  services: ServicePricingRecord[]
  modifiers: ServiceModifier[]
}

export type ServicePricing = Omit<ServicePricingRecord, 'modifiers'> & {
  modifiers: ServiceModifier[]
}

export type ServiceRecord = BaseService & {
  pricing: ServicePricing
}

const baseServices = servicesData as BaseService[]
const pricingCatalog = pricingData as PricingCatalog

const modifierById = new Map(pricingCatalog.modifiers.map((modifier) => [modifier.id, modifier]))
const pricingBySlug = new Map(pricingCatalog.services.map((pricing) => [pricing.slug, pricing]))

for (const service of baseServices) {
  if (!pricingBySlug.has(service.slug)) {
    throw new Error(`Missing pricing entry for service slug "${service.slug}".`)
  }
}

for (const pricing of pricingCatalog.services) {
  const matchedService = baseServices.find((service) => service.slug === pricing.slug)

  if (!matchedService) {
    throw new Error(`Pricing entry "${pricing.slug}" does not match any service.`)
  }

  for (const modifierId of pricing.modifiers) {
    const modifier = modifierById.get(modifierId)

    if (!modifier) {
      throw new Error(`Unknown pricing modifier "${modifierId}" on "${pricing.slug}".`)
    }

    if (!modifier.appliesTo.includes(pricing.slug)) {
      throw new Error(
        `Modifier "${modifierId}" must include "${pricing.slug}" in appliesTo when referenced.`,
      )
    }
  }
}

export const allServices: ServiceRecord[] = baseServices
  .map((service) => {
    const pricing = pricingBySlug.get(service.slug)

    if (!pricing) {
      throw new Error(`Missing pricing for service slug "${service.slug}".`)
    }

    return {
      ...service,
      pricing: {
        ...pricing,
        modifiers: pricing.modifiers.map((modifierId) => {
          const modifier = modifierById.get(modifierId)

          if (!modifier) {
            throw new Error(`Unknown pricing modifier "${modifierId}".`)
          }

          return modifier
        }),
      },
    }
  })
  .sort((left, right) => left.order - right.order)

export const featuredServices = allServices.filter((service) => service.featured && service.offered)
