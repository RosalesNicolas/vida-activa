import { sequelize } from './connection.js'
import { PasswordResetToken } from '../modules/auth/password-reset-token.model.js'

async function run() {
  try {
    await sequelize.authenticate()
    await PasswordResetToken.sync()

    console.log(
      'Tabla password_reset_tokens lista',
    )
  } catch (error) {
    console.error(
      'Error al crear la tabla:',
      error,
    )

    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

run()
