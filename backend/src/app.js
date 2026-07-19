import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { clientsRoutes } from './modules/clients/clients.routes.js'
import { measurementsRoutes } from './modules/measurements/measurements.routes.js'
import { routinesRoutes } from './modules/routines/routines.routes.js'
import { progressRoutes } from './modules/progress/progress.routes.js'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js'
import { notificationsRoutes } from './modules/notifications/notifications.routes.js'

export const app = express()

app.use(
  cors({
    origin: env.frontendUrl,
  }),
)
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API Vida Activa',
    availableRoutes: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/me',
      '/api/clients',
      '/api/measurements',
      '/api/routines',
      '/api/progress',
      '/api/dashboard',
      '/api/notifications',
    ],
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message:
      'Backend Vida Activa funcionando correctamente',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientsRoutes)

app.use(
  '/api/measurements',
  measurementsRoutes,
)

app.use('/api/routines', routinesRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(
  '/api/notifications',
  notificationsRoutes,
)
