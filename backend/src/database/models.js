import { User } from '../modules/users/user.model.js'
import { Client } from '../modules/clients/client.model.js'
import { Measurement } from '../modules/measurements/measurement.model.js'
import { Routine } from '../modules/routines/routine.model.js'
import { RoutineExercise } from '../modules/routines/routineExercise.model.js'
import { Progress } from '../modules/progress/progress.model.js'

User.hasOne(Client, {
  foreignKey: 'userId',
  as: 'clientProfile',
})

Client.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

Client.hasMany(Measurement, {
  foreignKey: 'clientId',
  as: 'measurements',
})

Measurement.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
})

Client.hasMany(Routine, {
  foreignKey: 'clientId',
  as: 'routines',
})

Routine.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
})

Routine.hasMany(RoutineExercise, {
  foreignKey: 'routineId',
  as: 'exercises',
  onDelete: 'CASCADE',
})

RoutineExercise.belongsTo(Routine, {
  foreignKey: 'routineId',
  as: 'routine',
})

Client.hasMany(Progress, {
  foreignKey: 'clientId',
  as: 'progressNotes',
})

Progress.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
})

export const models = {
  User,
  Client,
  Measurement,
  Routine,
  RoutineExercise,
  Progress,
}
