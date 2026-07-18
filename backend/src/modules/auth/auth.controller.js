import { sendPasswordResetEmail } from '../../services/email.service.js'
import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { User } from '../users/user.model.js'
import { PasswordResetToken } from './password-reset-token.model.js'

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email y contraseña son obligatorios',
      })
    }

    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      })
    }

    if (!user.active) {
      return res.status(403).json({
        ok: false,
        message: 'Usuario inactivo',
      })
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash)

    if (!passwordIsValid) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      env.jwtSecret,
      {
        expiresIn: '8h',
      },
    )

    return res.json({
      ok: true,
      message: 'Login correcto',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al iniciar sesión',
    })
  }
}

export async function getMe(req, res) {
  return res.json({
    ok: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      active: req.user.active,
    },
  })
}

export async function changePassword(req, res) {
  try {
    const {
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = req.body

    if (
      !currentPassword ||
      !newPassword ||
      !confirmNewPassword
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        ok: false,
        message: 'La nueva contraseña debe tener al menos 8 caracteres',
      })
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Las contraseñas nuevas no coinciden',
      })
    }

    const user = await User.findByPk(req.user.id)

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      })
    }

    const currentPasswordIsValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    )

    if (!currentPasswordIsValid) {
      return res.status(400).json({
        ok: false,
        message: 'La contraseña actual es incorrecta',
      })
    }

    const passwordIsRepeated = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    )

    if (passwordIsRepeated) {
      return res.status(400).json({
        ok: false,
        message: 'La nueva contraseña debe ser diferente de la actual',
      })
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12)
    user.tokenVersion += 1

    await user.save()

    return res.json({
      ok: true,
      message: 'Contraseña actualizada correctamente',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar la contraseña',
    })
  }
}


export async function forgotPassword(req, res) {
  try {
    const email =
      typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : ''

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'El email es obligatorio',
      })
    }

    const genericMessage =
      'Si el email está registrado, recibirás instrucciones para restablecer la contraseña'

    const user = await User.findOne({
      where: { email },
    })

    if (!user || !user.active) {
      return res.json({
        ok: true,
        message: genericMessage,
      })
    }

    await PasswordResetToken.destroy({
      where: {
        userId: user.id,
      },
    })

    const rawToken = randomBytes(32).toString('hex')

    const tokenHash = createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000,
    )

    await PasswordResetToken.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    })

    const resetUrl =
      `${env.frontendUrl}/reset-password?token=${rawToken}`

    let emailSent = false

    try {
      emailSent = await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
      })
    } catch (emailError) {
      console.error(
        'No se pudo enviar el correo de recuperación:',
        emailError,
      )
    }

    if (!emailSent) {
      console.log(
        `Enlace de recuperación para ${user.email}:`,
      )
      console.log(resetUrl)
    }

    const response = {
      ok: true,
      message: genericMessage,
    }

    if (env.nodeEnv !== 'production') {
      response.emailSent = emailSent

      if (!emailSent) {
        response.developmentResetUrl = resetUrl
      }
    }

    return res.json(response)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al solicitar la recuperación de contraseña',
    })
  }
}

export async function resetPassword(req, res) {
  try {
    const {
      token,
      newPassword,
      confirmNewPassword,
    } = req.body

    if (
      !token ||
      !newPassword ||
      !confirmNewPassword
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        ok: false,
        message:
          'La contraseña debe tener al menos 8 caracteres',
      })
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        ok: false,
        message:
          'Las contraseñas no coinciden',
      })
    }

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex')

    const passwordReset =
      await PasswordResetToken.findOne({
        where: {
          tokenHash,
        },
      })

    if (!passwordReset) {
      return res.status(400).json({
        ok: false,
        message:
          'El enlace es inválido o ya fue utilizado',
      })
    }

    if (
      new Date(passwordReset.expiresAt).getTime() <
      Date.now()
    ) {
      await passwordReset.destroy()

      return res.status(400).json({
        ok: false,
        message:
          'El enlace de recuperación venció',
      })
    }

    const user = await User.findByPk(
      passwordReset.userId,
    )

    if (!user || !user.active) {
      await passwordReset.destroy()

      return res.status(400).json({
        ok: false,
        message:
          'El enlace es inválido o ya fue utilizado',
      })
    }

    const repeatedPassword = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    )

    if (repeatedPassword) {
      return res.status(400).json({
        ok: false,
        message:
          'La nueva contraseña debe ser diferente de la actual',
      })
    }

    user.passwordHash = await bcrypt.hash(
      newPassword,
      12,
    )

    user.tokenVersion += 1

    await user.save()

    await PasswordResetToken.destroy({
      where: {
        userId: user.id,
      },
    })

    return res.json({
      ok: true,
      message:
        'Contraseña restablecida correctamente',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al restablecer la contraseña',
    })
  }
}






