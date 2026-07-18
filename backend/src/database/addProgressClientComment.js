import { sequelize } from './connection.js'

async function run() {
  try {
    await sequelize.authenticate()

    const [columns] = await sequelize.query(
      'PRAGMA table_info(progress_notes)',
    )

    const columnExists = columns.some(
      (column) => column.name === 'clientComment',
    )

    if (!columnExists) {
      await sequelize.query(
        'ALTER TABLE progress_notes ADD COLUMN clientComment VARCHAR(500)',
      )

      console.log('Columna clientComment agregada correctamente')
    } else {
      console.log('La columna clientComment ya existe')
    }
  } catch (error) {
    console.error('Error al actualizar la tabla:', error)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

run()
