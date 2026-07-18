import { DataTypes } from 'sequelize'
import { sequelize } from '../../database/connection.js'

export const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
  },
  {
    tableName: 'notifications',

    indexes: [
      {
        fields: ['recipientUserId'],
      },
      {
        fields: ['clientId'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['readAt'],
      },
      {
        fields: ['resolvedAt'],
      },
      {
        name: 'notifications_recipient_condition_unique',
        unique: true,
        fields: [
          'recipientUserId',
          'conditionKey',
        ],
      },
    ],
  },
)
