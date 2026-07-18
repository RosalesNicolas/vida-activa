import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../modules/users/user.model.js'

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        ok: false,
        message: 'Token no enviado',
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, env.jwtSecret)

    const user = await User.findByPk(decoded.id, {
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'active',
        'tokenVersion',
      ],
    })

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no encontrado',
      })
    }

    if (!user.active) {
      return res.status(403).json({
        ok: false,
        message: 'Usuario inactivo',
      })
    }

    if (
      decoded.tokenVersion === undefined ||
      decoded.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({
        ok: false,
        message:
          'La sesión dejó de ser válida. Iniciá sesión nuevamente.',
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o expirado',
    })
  }
}
