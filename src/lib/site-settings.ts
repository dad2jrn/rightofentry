import siteSettings from '../content/site-settings.json'

const normalizedSiteEnabled = `${siteSettings.site_enabled ?? ''}`.trim().toLowerCase()

export const SITE_ENABLED = normalizedSiteEnabled === 'true'

export const getSiteEnabled = () => SITE_ENABLED
