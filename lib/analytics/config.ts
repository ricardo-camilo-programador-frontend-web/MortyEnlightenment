export interface AnalyticsEnv {
  CLARITY_ID?: string
  GA4_ID?: string
  GTM_ID?: string
  GTM_ENABLED?: string | boolean
  GTM_GA4_ID?: string
  COUNTER_ID?: string
  COUNTER_UTCOFFSET?: string | number
  ANALYTICS_ENABLED?: string | boolean
  GA_MEASUREMENT_ID?: string
  COUNTER_DEV_ID?: string
}

export interface AnalyticsConfig {
  clarityId: string
  ga4Id: string
  gtmId: string
  gtmEnabled: boolean
  gtmGa4Id: string
  counterId: string
  counterUtcOffset: string
  analyticsEnabled: boolean
}

export const ANALYTICS_DEFAULTS = {
  clarityId: 'yyrpy0dlhk',
  ga4Id: 'G-87QFNQ4H1R',
  gtmId: '',
  gtmEnabled: false,
  gtmGa4Id: '',
  counterId: 'f30df6f3-776d-4154-959d-0210ac8a8325',
  counterUtcOffset: '-3',
  analyticsEnabled: true
}

const PLACEHOLDER_IDS = new Set(['G-XXXXXXXXXX', 'GTM-XXXXXXX'])

function resolveValue (value: string | boolean | number | undefined, fallback: string): string {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' || PLACEHOLDER_IDS.has(trimmed) ? fallback : trimmed
}

export function resolveAnalyticsConfig (env: AnalyticsEnv = {}): AnalyticsConfig {
  const ga4Id = resolveValue(env.GA4_ID, resolveValue(env.GA_MEASUREMENT_ID, ANALYTICS_DEFAULTS.ga4Id))
  const gtmGa4Id = resolveValue(env.GTM_GA4_ID, ANALYTICS_DEFAULTS.gtmGa4Id)
  const gtmId = resolveValue(env.GTM_ID, ANALYTICS_DEFAULTS.gtmId)

  return {
    clarityId: resolveValue(env.CLARITY_ID, ANALYTICS_DEFAULTS.clarityId),
    ga4Id,
    gtmId,
    gtmEnabled: String(env.GTM_ENABLED ?? ANALYTICS_DEFAULTS.gtmEnabled).trim() === 'true' && gtmId !== '',
    gtmGa4Id,
    counterId: resolveValue(env.COUNTER_ID, resolveValue(env.COUNTER_DEV_ID, ANALYTICS_DEFAULTS.counterId)),
    counterUtcOffset: resolveValue(env.COUNTER_UTCOFFSET, ANALYTICS_DEFAULTS.counterUtcOffset),
    analyticsEnabled: String(env.ANALYTICS_ENABLED ?? ANALYTICS_DEFAULTS.analyticsEnabled).trim() !== 'false'
  }
}
