import { Router } from 'express'
import {
  activateClient,
  createClient,
  deactivateClient,
  getClientById,
  getMyClientProfile,
  listClients,
  updateClient,
  updateMyClientProfile,
} from './clients.controller.js'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'

export const clientsRoutes = Router()

clientsRoutes.use(authenticateToken)

clientsRoutes.get(
  '/me',
  authorizeRoles('client'),
  getMyClientProfile,
)

clientsRoutes.put(
  '/me',
  authorizeRoles('client'),
  updateMyClientProfile,
)

clientsRoutes.get(
  '/',
  authorizeRoles('admin'),
  listClients,
)

clientsRoutes.post(
  '/',
  authorizeRoles('admin'),
  createClient,
)

clientsRoutes.put(
  '/:id',
  authorizeRoles('admin'),
  updateClient,
)

clientsRoutes.patch(
  '/:id/deactivate',
  authorizeRoles('admin'),
  deactivateClient,
)

clientsRoutes.patch(
  '/:id/activate',
  authorizeRoles('admin'),
  activateClient,
)

clientsRoutes.get(
  '/:id',
  authorizeRoles('admin'),
  getClientById,
)
