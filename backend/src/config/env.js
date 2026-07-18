import dotenv from 'dotenv'

dotenv.config({ quiet: true })

export const env = {
  port: process.env.PORT || 3000,
  dbStorage:
    process.env.DB_STORAGE ||
    './src/database/fitcoach.sqlite',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  frontendUrl:
    process.env.FRONTEND_URL ||
    'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',

  emailHost: process.env.EMAIL_HOST || '',
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailFrom:
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    'no-reply@vidaactiva.local',
}

