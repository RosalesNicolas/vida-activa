import { DataTypes, Op } from 'sequelize'
import { sequelize } from '../connection.js'

async function migrate() {
  const queryInterface =
    sequelize.getQueryInterface()

  const table =
    await queryInterface.describeTable(
      'progress_notes',
    )

  if (!table.clientCommentEditable) {
    await queryInterface.addColumn(
      'progress_notes',
      'clientCommentEditable',
      {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    )

    await queryInterface.bulkUpdate(
      'progress_notes',
      {
        clientCommentEditable: false,
      },
      {
        clientComment: {
          [Op.ne]: null,
        },
      },
    )
  }

  console.log(
    'Migración de respuestas completada',
  )
}

try {
  await migrate()
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await sequelize.close()
}
