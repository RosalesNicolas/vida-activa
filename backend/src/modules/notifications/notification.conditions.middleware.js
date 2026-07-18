import { syncNotificationConditions } from './notification.conditions.service.js'

export async function syncNotificationConditionsMiddleware(
  req,
  res,
  next,
) {
  try {
    await syncNotificationConditions()
  } catch (error) {
    console.error(
      'No pudieron sincronizarse las alertas automáticas:',
      error,
    )
  }

  next()
}
