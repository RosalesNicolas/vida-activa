import { rateLimit } from 'express-rate-limit'

function createLimitHandler(message) {
  return (req, res) => {
    return res.status(429).json({
      ok: false,
      message,
    })
  }
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: createLimitHandler(
    'Demasiados intentos de inicio de sesión. Esperá 15 minutos e intentá nuevamente.',
  ),
})

export const forgotPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: createLimitHandler(
    'Se solicitaron demasiados correos de recuperación. Esperá 30 minutos.',
  ),
})

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: createLimitHandler(
    'Demasiados intentos para restablecer la contraseña. Esperá 15 minutos.',
  ),
})
