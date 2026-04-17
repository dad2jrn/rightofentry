import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    location: z.string(),
    service: z.string(),
    quote: z.string(),
    rating: z.number().int().min(1).max(5),
  }),
})

export const collections = {
  testimonials,
}
