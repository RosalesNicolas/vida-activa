import { Router } from 'express'
import {
  createMeasurement,
  createMyMeasurement,
  deleteMeasurement,
  getMeasurementById,
  listMeasurementEvolutionByClient,
  listMeasurementsByClient,
  listMyMeasurementEvolution,
  listMyMeasurements,
  updateMeasurement,
} from './measurements.controller.js'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'

export const measurementsRoutes = Router()

measurementsRoutes.use(authenticateToken)

measurementsRoutes.get(
  '/me/evolution',
  authorizeRoles('client'),
  listMyMeasurementEvolution,
)

measurementsRoutes.get(
  '/me',
  authorizeRoles('client'),
  listMyMeasurements,
)

measurementsRoutes.post(
  '/me',
  authorizeRoles('client'),
  createMyMeasurement,
)

measurementsRoutes.get(
  '/client/:clientId/evolution',
  authorizeRoles('admin'),
  listMeasurementEvolutionByClient,
)

measurementsRoutes.get(
  '/client/:clientId',
  authorizeRoles('admin'),
  listMeasurementsByClient,
)

measurementsRoutes.post(
  '/',
  authorizeRoles('admin'),
  createMeasurement,
)

measurementsRoutes.get(
  '/:id',
  getMeasurementById,
)

measurementsRoutes.put(
  '/:id',
  updateMeasurement,
)

measurementsRoutes.delete(
  '/:id',
  authorizeRoles('admin'),
  deleteMeasurement,
)
