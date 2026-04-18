import { type ChangeEvent, type FormEvent, type FocusEvent, useState } from 'react'

import { cn } from '../../lib/cn'

const SERVICE_OPTIONS = [
  'Rekey',
  'Lock installation',
  'Commercial inquiry',
  'Other',
] as const

const FIELD_ORDER = ['name', 'email', 'phone', 'service', 'message', 'reference'] as const

type FieldName = (typeof FIELD_ORDER)[number]

type FormValues = Record<FieldName, string>
type FormErrors = Partial<Record<FieldName, string>>

type Props = {
  phone: string
  phoneHref: string
}

const initialValues: FormValues = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  reference: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getFieldId = (fieldName: FieldName) => `contact-${fieldName}`

const validateField = (fieldName: FieldName, values: FormValues): string | undefined => {
  const value = values[fieldName].trim()

  switch (fieldName) {
    case 'name':
      return value ? undefined : 'Enter your name.'
    case 'email':
      if (!value) return 'Enter your email address.'
      return emailPattern.test(value) ? undefined : 'Enter a valid email address.'
    case 'phone':
      return undefined
    case 'service':
      return value ? undefined : 'Select the service you need.'
    case 'message':
      if (!value) return 'Enter a message.'
      return value.length >= 10 ? undefined : 'Message must be at least 10 characters.'
    case 'reference':
      return values.reference ? 'Invalid submission.' : undefined
    default:
      return undefined
  }
}

const validateForm = (values: FormValues): FormErrors => {
  const nextErrors: FormErrors = {}

  for (const fieldName of FIELD_ORDER) {
    const error = validateField(fieldName, values)

    if (error) {
      nextErrors[fieldName] = error
    }
  }

  return nextErrors
}

export function ContactForm({ phone, phoneHref }: Props) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateField = (fieldName: FieldName, nextValue: string) => {
    setValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [fieldName]: nextValue,
      }

      setErrors((currentErrors) => {
        if (!currentErrors[fieldName]) {
          return currentErrors
        }

        const nextError = validateField(fieldName, nextValues)

        if (!nextError) {
          const { [fieldName]: _removed, ...rest } = currentErrors
          return rest
        }

        return {
          ...currentErrors,
          [fieldName]: nextError,
        }
      })

      return nextValues
    })
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const fieldName = event.target.name as FieldName
    updateField(fieldName, event.target.value)
  }

  const handleBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const fieldName = event.target.name as FieldName
    const nextError = validateField(fieldName, values)

    setErrors((currentErrors) => {
      if (!nextError) {
        const { [fieldName]: _removed, ...rest } = currentErrors
        return rest
      }

      return {
        ...currentErrors,
        [fieldName]: nextError,
      }
    })
  }

  const focusFirstInvalidField = (nextErrors: FormErrors) => {
    const firstInvalidField = FIELD_ORDER.find((fieldName) => nextErrors[fieldName])

    if (!firstInvalidField) {
      return
    }

    const field = document.getElementById(getFieldId(firstInvalidField))
    field?.focus()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const nextErrors = validateForm(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      focusFirstInvalidField(nextErrors)
      setSubmitError('Check the highlighted fields and try again.')
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          service: values.service,
          message: values.message.trim(),
          reference: values.reference.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setIsSubmitted(true)
      setValues(initialValues)
    } catch {
      setSubmitError(
        'We could not send your message online yet. Try again, or call if the job is time-sensitive.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-card border-line bg-surface border p-5 md:p-6">
        <p className="text-11 tracking-caps-3 text-accent-dark font-medium uppercase">
          Message received
        </p>
        <h3 className="text-28 tracking-h2-sm text-ink mt-3 font-medium leading-tight">
          Thank you. We&apos;ll follow up shortly.
        </h3>
        <p className="text-15 leading-body text-ink-soft mt-4 max-w-[56ch]">
          Your inquiry has been submitted. If the situation becomes urgent before we reply,
          call {phone} so you can speak to someone directly.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={phoneHref}
            className="rounded-sharp bg-ink text-13 tracking-button text-paper hover:bg-ink-soft inline-flex items-center justify-center gap-2 px-6 py-3.5 font-medium transition-colors duration-200"
          >
            <span className="bg-live h-1.5 w-1.5 rounded-full" aria-hidden="true"></span>
            <span>Call {phone}</span>
          </a>
          <button
            type="button"
            className="rounded-sharp border-ink text-13 tracking-button text-ink hover:bg-ink hover:text-paper inline-flex items-center justify-center border px-6 py-3.5 font-medium transition-colors duration-200"
            onClick={() => {
              setIsSubmitted(false)
              setSubmitError(null)
            }}
          >
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="rounded-card border-line bg-surface border p-5 md:p-6">
      <div aria-live="polite" className="mb-5 min-h-0">
        {submitError ? (
          <div className="rounded-card border border-[color:var(--color-emergency)] bg-[rgb(177_59_46_/_0.08)] p-4">
            <p className="text-13 font-medium text-[color:var(--color-emergency)]">We couldn&apos;t send the form.</p>
            <p className="text-13 leading-snug text-ink-soft mt-2">
              {submitError}{' '}
              <a
                href={phoneHref}
                className="text-ink hover:text-accent underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-current"
              >
                Call {phone}
              </a>
              {' '}if you need an immediate response.
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={getFieldId('name')}>
            Name
          </label>
          <input
            id={getFieldId('name')}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${getFieldId('name')}-error` : undefined}
            className={cn('field-input', errors.name && 'border-[color:var(--color-emergency)]')}
            placeholder="Your name"
          />
          {errors.name ? (
            <p id={`${getFieldId('name')}-error`} className="field-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor={getFieldId('email')}>
            Email
          </label>
          <input
            id={getFieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${getFieldId('email')}-error` : undefined}
            className={cn('field-input', errors.email && 'border-[color:var(--color-emergency)]')}
            placeholder="name@example.com"
          />
          {errors.email ? (
            <p id={`${getFieldId('email')}-error`} className="field-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor={getFieldId('phone')}>
            Phone
          </label>
          <input
            id={getFieldId('phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby="contact-phone-note"
            className="field-input"
            placeholder="Best callback number"
          />
          <p id="contact-phone-note" className="text-12 leading-snug text-muted mt-2">
            Optional, but helpful if you want a call back faster.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor={getFieldId('service')}>
            Service needed
          </label>
          <select
            id={getFieldId('service')}
            name="service"
            value={values.service}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? `${getFieldId('service')}-error` : undefined}
            className={cn('field-select', errors.service && 'border-[color:var(--color-emergency)]')}
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.service ? (
            <p id={`${getFieldId('service')}-error`} className="field-error">
              {errors.service}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="field-label" htmlFor={getFieldId('message')}>
            Message
          </label>
          <textarea
            id={getFieldId('message')}
            name="message"
            rows={6}
            value={values.message}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${getFieldId('message')}-error` : undefined}
            className={cn(
              'field-textarea min-h-36 resize-y',
              errors.message && 'border-[color:var(--color-emergency)]',
            )}
            placeholder="Describe the job, timing, or question."
          />
          {errors.message ? (
            <p id={`${getFieldId('message')}-error`} className="field-error">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field-meta" aria-hidden="true">
        <label htmlFor={getFieldId('reference')}>Reference</label>
        <input
          id={getFieldId('reference')}
          name="reference"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.reference}
          onChange={handleChange}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-sharp bg-ink text-13 tracking-button text-paper hover:bg-ink-soft inline-flex items-center justify-center gap-2 px-6 py-3.5 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>

        <p className="text-13 leading-snug text-muted">
          Need help faster?
          <a
            href={phoneHref}
            className="text-ink hover:text-accent ml-1 underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-current"
          >
            Call {phone}
          </a>
        </p>
      </div>
    </form>
  )
}

export default ContactForm
