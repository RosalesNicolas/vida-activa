import { app } from './app.js'
import { env } from './config/env.js'
import { sequelize } from './database/connection.js'
import './database/models.js'

async function startServer() {
  try {
    await sequelize.authenticate()

    await sequelize.sync()

    console.log('Base de datos conectada correctamente')
    console.log('Tablas sincronizadas correctamente')

    app.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Error al iniciar el servidor')
    console.error(error)
    process.exit(1)
  }
}

startServer()
