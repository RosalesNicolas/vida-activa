import dns from 'node:dns'
import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

dns.setDefaultResultOrder('ipv4first')

function emailIsConfigured() {
  return Boolean(
    env.emailHost &&
      env.emailPort &&
      env.emailUser &&
      env.emailPassword,
  )
}

function createTransporter() {
  return nodemailer.createTransport({
    host: env.emailHost,
    port: env.emailPort,
    secure: env.emailSecure,
    family: 4,
    auth: {
      user: env.emailUser,
      pass: env.emailPassword,
    },
  })
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}) {
  if (!emailIsConfigured()) {
    return false
  }

  const transporter = createTransporter()

  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject: 'Recuperación de contraseña - Vida Activa',

    text: `
Recibimos una solicitud para restablecer tu contraseña.

Abrí el siguiente enlace:

${resetUrl}

El enlace vence en 30 minutos y solo puede utilizarse una vez.

Si no solicitaste el cambio, ignorá este correo.
    `.trim(),

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Recuperación de contraseña</h2>

        <p>
          Recibimos una solicitud para restablecer tu contraseña
          de Vida Activa.
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 18px;
              background: #212529;
              color: white;
              text-decoration: none;
              border-radius: 4px;
            "
          >
            Restablecer contraseña
          </a>
        </p>

        <p>
          El enlace vence en 30 minutos y solo puede utilizarse
          una vez.
        </p>

        <p>
          Si no solicitaste el cambio, ignorá este correo.
        </p>
      </div>
    `,
  })

  return true
}
