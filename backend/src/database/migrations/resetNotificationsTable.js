import { sequelize } from '../connection.js'

async function tableExists(
  queryInterface,
  tableName,
) {
  const tables =
    await queryInterface.showAllTables()

  return tables.some((table) => {
    if (typeof table === 'string') {
      return table === tableName
    }

    return (
      table.tableName === tableName ||
      table.name === tableName
    )
  })
}

try {
  const queryInterface =
    sequelize.getQueryInterface()

  const exists = await tableExists(
    queryInterface,
    'notifications',
  )

  if (exists) {
    await queryInterface.dropTable(
      'notifications',
    )
  }

  console.log(
    'Tabla notifications eliminada',
  )
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await sequelize.close()
}
