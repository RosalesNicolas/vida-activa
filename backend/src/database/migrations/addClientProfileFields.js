import { DataTypes } from 'sequelize'
import { sequelize } from '../connection.js'

const queryInterface = sequelize.getQueryInterface()

const newColumns = {
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },

  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  sex: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },

  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  occupation: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },

  injuries: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  diseases: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  medications: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  emergencyContactName: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },

  emergencyContactPhone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
}

async function runMigration() {
  try {
    const currentColumns =
      await queryInterface.describeTable('clients')

    for (const [columnName, definition] of Object.entries(
      newColumns,
    )) {
      if (!currentColumns[columnName]) {
        await queryInterface.addColumn(
          'clients',
          columnName,
          definition,
        )

        console.log(`Columna agregada: ${columnName}`)
      } else {
        console.log(`La columna ya existe: ${columnName}`)
      }
    }

    console.log(
      'Migración de perfil de cliente completada.',
    )
  } catch (error) {
    console.error(
      'Error al ejecutar la migración:',
      error,
    )

    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

runMigration()
