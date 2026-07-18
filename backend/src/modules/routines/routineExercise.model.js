import { DataTypes } from 'sequelize'
import { sequelize } from '../../database/connection.js'

export const RoutineExercise = sequelize.define(
  'RoutineExercise',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    routineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    dayOfWeek: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    exerciseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    series: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    unit: {
      type: DataTypes.ENUM('repeticiones', 'segundos'),
      allowNull: false,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'routine_exercises',
  },
)
