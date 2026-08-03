import { Router } from 'express'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import { authorizeRoles } from '../../middlewares/role.middleware.js'
import { downloadDatabaseBackup } from './backups.controller.js'

export const backupsRoutes = Router()

backupsRoutes.get(
  '/database',
  authenticateToken,
  authorizeRoles('admin'),
  downloadDatabaseBackup,
)
