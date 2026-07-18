import bcrypt from 'bcryptjs'
import { sequelize } from './connection.js'
import '../database/models.js'
import { User } from '../modules/users/user.model.js'

async function seedAdmin() {
  try {
    const adminEmail =
      process.env.ADMIN_EMAIL?.trim().toLowerCase()

    const adminName =
      process.env.ADMIN_NAME?.trim()

    const adminPassword =
      process.env.ADMIN_PASSWORD

    if (
      !adminEmail ||
      !adminName ||
      !adminPassword
    ) {
      throw new Error(
        'Faltan ADMIN_EMAIL, ADMIN_NAME o ADMIN_PASSWORD en las variables de entorno',
      )
    }

    if (adminPassword.length < 8) {
      throw new Error(
        'ADMIN_PASSWORD debe tener al menos 8 caracteres',
      )
    }

    await sequelize.authenticate()
    await sequelize.sync()

    const existingAdmin = await User.findOne({
      where: {
        email: adminEmail,
      },
    })

    if (existingAdmin) {
      existingAdmin.name = adminName
      existingAdmin.role = 'admin'
      existingAdmin.active = true

      await existingAdmin.save()

      console.log(
        'El usuario administrador ya existía. Datos actualizados.',
      )

      console.log(`Email: ${adminEmail}`)
      return
    }

    const passwordHash =
      await bcrypt.hash(
        adminPassword,
        10,
      )

    await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      active: true,
    })

    console.log(
      'Usuario administrador creado correctamente',
    )

    console.log(`Nombre: ${adminName}`)
    console.log(`Email: ${adminEmail}`)
  } catch (error) {
    console.error(
      'Error al crear el usuario administrador',
    )

    console.error(error)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

seedAdmin()
