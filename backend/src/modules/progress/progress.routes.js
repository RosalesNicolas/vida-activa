import { Router } from 'express'
import {
  createProgressNote,
  listMyProgress,
  listProgressByClient,
  setClientCommentEditing,
  updateClientComment,
  updateProgressNote,
} from './progress.controller.js'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'

export const progressRoutes = Router()

progressRoutes.use(authenticateToken)

progressRoutes.get(
  '/me',
  authorizeRoles('client'),
  listMyProgress,
)

progressRoutes.patch(
  '/:id/client-comment',
  authorizeRoles('client'),
  updateClientComment,
)

progressRoutes.patch(
  '/:id/client-comment-editing',
  authorizeRoles('admin'),
  setClientCommentEditing,
)

progressRoutes.post(
  '/',
  authorizeRoles('admin'),
  createProgressNote,
)

progressRoutes.put(
  '/:id',
  authorizeRoles('admin'),
  updateProgressNote,
)

progressRoutes.get(
  '/client/:clientId',
  authorizeRoles('admin'),
  listProgressByClient,
)
