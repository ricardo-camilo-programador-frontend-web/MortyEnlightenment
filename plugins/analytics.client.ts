import { resolveAnalyticsConfig } from '~/lib/analytics/config'

type TagFunction = (...args: unknown[]) => void

interface AnalyticsWindow {
  dataLayer?: unknown[]
  gtag?: TagFunction
  clarity?: TagFunction
}

function injectScript (options: { src?: string; text?: string; attrs?: Record<string, string> }): void {
  const script = document.createElement('script')
  if (options.src !== undefined) { script.src = options.src }
  if (options.text !== undefined) { script.text = options.text }
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    script.setAttribute(name, value)
  }
  document.head.appendChild(script)
}

function injectGoogleTagManager (gtmId: string): void {
  injectScript({
    text: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
  })
}

function injectGoogleAnalytics4 (ga4Id: string): void {
  injectScript({ src: `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`, attrs: { async: '' } })
  const analyticsWindow = window as unknown as AnalyticsWindow
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
  analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.dataLayer?.push(args)
  analyticsWindow.gtag('js', new Date())
  analyticsWindow.gtag('config', ga4Id)
}

function injectClarity (clarityId: string): void {
  injectScript({
    text: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",'${clarityId}');`
  })
}

function injectCounter (counterId: string, counterUtcOffset: string): void {
  injectScript({
    src: 'https://cdn.counter.dev/script.js',
    attrs: { async: '', 'data-id': counterId, 'data-utcoffset': counterUtcOffset }
  })
}

export default defineNuxtPlugin(() => {
  const publicConfig = useRuntimeConfig().public
  const config = resolveAnalyticsConfig({
    CLARITY_ID: publicConfig.clarityId,
    GA4_ID: publicConfig.ga4Id,
    GTM_ID: publicConfig.gtmId,
    GTM_ENABLED: publicConfig.gtmEnabled,
    GTM_GA4_ID: publicConfig.gtmGa4Id,
    COUNTER_ID: publicConfig.counterId,
    COUNTER_UTCOFFSET: publicConfig.counterUtcOffset,
    ANALYTICS_ENABLED: publicConfig.analyticsEnabled,
    GA_MEASUREMENT_ID: publicConfig.gaMeasurementId,
    COUNTER_DEV_ID: publicConfig.counterDevId
  })

  if (!config.analyticsEnabled) { return }

  const googleTagManagerLoaded = config.gtmEnabled && config.gtmId !== ''
  if (googleTagManagerLoaded) {
    injectGoogleTagManager(config.gtmId)
  }

  // GTM reporting the same GA4 property -> skip direct gtag to avoid double counting
  const ga4HandledByGoogleTagManager = googleTagManagerLoaded && config.gtmGa4Id === config.ga4Id
  if (!ga4HandledByGoogleTagManager && config.ga4Id !== '') {
    injectGoogleAnalytics4(config.ga4Id)
  }

  injectClarity(config.clarityId)
  injectCounter(config.counterId, config.counterUtcOffset)
})
