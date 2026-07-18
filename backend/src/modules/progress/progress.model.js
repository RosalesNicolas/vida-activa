import { DataTypes } from 'sequelize'
import { sequelize } from '../../database/connection.js'

export const Progress = sequelize.define(
  'Progress',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'en_proceso',
    },

    nextAction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    visibleToClient: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    clientComment: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    clientCommentEditable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'progress_notes',
  },
)

