import { Router } from 'express'
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  resetPassword,
} from './auth.controller.js'
import { authenticateToken } from '../../middlewares/auth.middleware.js'
import {
  forgotPasswordLimiter,
  loginLimiter,
  resetPasswordLimiter,
} from '../../middlewares/auth-rate-limit.middleware.js'

export const authRoutes = Router()

authRoutes.post(
  '/login',
  loginLimiter,
  login,
)

authRoutes.post(
  '/forgot-password',
  forgotPasswordLimiter,
  forgotPassword,
)

authRoutes.post(
  '/reset-password',
  resetPasswordLimiter,
  resetPassword,
)

authRoutes.get(
  '/me',
  authenticateToken,
  getMe,
)

authRoutes.put(
  '/change-password',
  authenticateToken,
  changePassword,
)
