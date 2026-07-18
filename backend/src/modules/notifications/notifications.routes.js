import { Router } from 'express'
import {
  attendNotification,
  getNotificationSummary,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  reopenNotification,
} from './notifications.controller.js'
import { syncNotificationConditionsMiddleware } from './notification.conditions.middleware.js'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'

export const notificationsRoutes = Router()

notificationsRoutes.use(
  authenticateToken,
)

notificationsRoutes.use(
  authorizeRoles('admin'),
)

notificationsRoutes.get(
  '/summary',
  syncNotificationConditionsMiddleware,
  getNotificationSummary,
)

notificationsRoutes.patch(
  '/read-all',
  markAllNotificationsAsRead,
)

notificationsRoutes.get(
  '/',
  syncNotificationConditionsMiddleware,
  listNotifications,
)

notificationsRoutes.patch(
  '/:id/read',
  markNotificationAsRead,
)

notificationsRoutes.patch(
  '/:id/attend',
  attendNotification,
)

notificationsRoutes.patch(
  '/:id/reopen',
  reopenNotification,
)
