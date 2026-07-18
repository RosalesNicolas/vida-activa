import { DataTypes } from 'sequelize'
import { sequelize } from '../../database/connection.js'

export const Client = sequelize.define(
  'Client',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

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

    objective: {
      type: DataTypes.STRING,
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

    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: 'clients',
  },
)
