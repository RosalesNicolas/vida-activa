import { sequelize } from './connection.js'

async function run() {
  try {
    await sequelize.authenticate()

    const [columns] = await sequelize.query(
      'PRAGMA table_info(users)',
    )

    const columnExists = columns.some(
      (column) => column.name === 'tokenVersion',
    )

    if (!columnExists) {
      await sequelize.query(
        'ALTER TABLE users ADD COLUMN tokenVersion INTEGER NOT NULL DEFAULT 0',
      )

      console.log('Columna tokenVersion agregada correctamente')
    } else {
      console.log('La columna tokenVersion ya existe')
    }
  } catch (error) {
    console.error('Error al actualizar users:', error)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

run()
