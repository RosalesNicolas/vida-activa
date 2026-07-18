import { DataTypes } from 'sequelize'
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

async function migrate() {
  const queryInterface =
    sequelize.getQueryInterface()

  const exists = await tableExists(
    queryInterface,
    'notifications',
  )

  if (exists) {
    console.log(
      'La tabla notifications ya existe',
    )

    return
  }

  await queryInterface.createTable(
    'notifications',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      recipientUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      type: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },

      category: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'event',
      },

      title: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      actionUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      conditionKey: {
        type: DataTypes.STRING(180),
        allowNull: true,
      },

      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      attendedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      resolutionType: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
  )

  await queryInterface.addIndex(
    'notifications',
    ['recipientUserId'],
    {
      name:
        'notifications_recipient_user_id',
    },
  )

  await queryInterface.addIndex(
    'notifications',
    ['clientId'],
    {
      name: 'notifications_client_id',
    },
  )

  await queryInterface.addIndex(
    'notifications',
    [
      'recipientUserId',
      'conditionKey',
    ],
    {
      name:
        'notifications_recipient_condition_unique',
      unique: true,
    },
  )

  await queryInterface.addIndex(
    'notifications',
    ['createdAt'],
    {
      name: 'notifications_created_at',
    },
  )

  await queryInterface.addIndex(
    'notifications',
    ['resolvedAt'],
    {
      name: 'notifications_resolved_at',
    },
  )

  console.log(
    'Tabla notifications preparada correctamente',
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
