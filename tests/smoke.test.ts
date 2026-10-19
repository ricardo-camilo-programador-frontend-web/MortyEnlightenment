import { describe, it, expect } from 'vitest'
import { resolveAnalyticsConfig, ANALYTICS_DEFAULTS } from '~/lib/analytics/config'

describe('Analytics smoke test', () => {
  it('resolves default analytics config correctly', () => {
    const config = resolveAnalyticsConfig()
    expect(config.clarityId).toBe(ANALYTICS_DEFAULTS.clarityId)
    expect(config.ga4Id).toBe(ANALYTICS_DEFAULTS.ga4Id)
    expect(config.counterId).toBe(ANALYTICS_DEFAULTS.counterId)
    expect(config.counterUtcOffset).toBe('-3')
    expect(config.analyticsEnabled).toBe(true)
  })

  it('respects overridden environment settings', () => {
    const custom = resolveAnalyticsConfig({
      CLARITY_ID: 'custom_clarity',
      GA4_ID: 'G-CUSTOM1234',
      ANALYTICS_ENABLED: 'false'
    })
    expect(custom.clarityId).toBe('custom_clarity')
    expect(custom.ga4Id).toBe('G-CUSTOM1234')
    expect(custom.analyticsEnabled).toBe(false)
  })
})
