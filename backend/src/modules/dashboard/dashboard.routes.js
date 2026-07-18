import { Router } from 'express'
import {
  getAdminDashboard,
  getClientDashboard,
} from './dashboard.controller.js'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'

export const dashboardRoutes = Router()

dashboardRoutes.use(authenticateToken)

dashboardRoutes.get(
  '/admin',
  authorizeRoles('admin'),
  getAdminDashboard,
)

dashboardRoutes.get(
  '/client',
  authorizeRoles('client'),
  getClientDashboard,
)
