import { Router } from 'express'
import {
  activateRoutine,
  createRoutine,
  deactivateRoutine,
  listMyRoutines,
  listRoutinesByClient,
  updateRoutine,
} from './routines.controller.js'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'

export const routinesRoutes = Router()

routinesRoutes.use(authenticateToken)

routinesRoutes.get(
  '/me',
  authorizeRoles('client'),
  listMyRoutines,
)

routinesRoutes.post(
  '/',
  authorizeRoles('admin'),
  createRoutine,
)

routinesRoutes.put(
  '/:id',
  authorizeRoles('admin'),
  updateRoutine,
)

routinesRoutes.get(
  '/client/:clientId',
  authorizeRoles('admin'),
  listRoutinesByClient,
)

routinesRoutes.patch(
  '/:id/deactivate',
  authorizeRoles('admin'),
  deactivateRoutine,
)

routinesRoutes.patch(
  '/:id/activate',
  authorizeRoles('admin'),
  activateRoutine,
)
