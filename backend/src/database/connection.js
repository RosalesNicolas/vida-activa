import { Sequelize } from 'sequelize'
import { env } from '../config/env.js'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.dbStorage,
  logging: false,
})