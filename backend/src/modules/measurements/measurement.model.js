import { DataTypes } from 'sequelize'
import { sequelize } from '../../database/connection.js'

export const Measurement = sequelize.define(
  'Measurement',
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

    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    waist: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    
    hip: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    chest: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    arm: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    leg: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    bodyFatPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'measurements',
  },
)
