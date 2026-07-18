import { sequelize } from '../../database/connection.js'
import { Client } from '../clients/client.model.js'
import { Routine } from './routine.model.js'
import { RoutineExercise } from './routineExercise.model.js'

const routineInclude = [
  {
    model: RoutineExercise,
    as: 'exercises',
    separate: true,
    order: [['order', 'ASC']],
  },
]

function getPagination(query) {
  const requestedPage = Number.parseInt(
    query.page,
    10,
  )

  const requestedLimit = Number.parseInt(
    query.limit,
    10,
  )

  const page =
    Number.isFinite(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1

  const limit =
    Number.isFinite(requestedLimit) &&
    requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : 5

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  }
}

function buildPagination({
  page,
  limit,
  total,
}) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(
      1,
      Math.ceil(total / limit),
    ),
  }
}

function validateExercises(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return 'La rutina debe contener al menos un ejercicio'
  }

  for (const exercise of exercises) {
    if (
      !exercise.exerciseName ||
      !exercise.series ||
      !exercise.amount ||
      !exercise.unit
    ) {
      return 'Cada ejercicio debe tener nombre, series, cantidad y unidad'
    }

    if (!['repeticiones', 'segundos'].includes(exercise.unit)) {
      return 'La unidad debe ser repeticiones o segundos'
    }
  }

  return null
}

export async function createRoutine(req, res) {
  const transaction = await sequelize.transaction()

  try {
    const {
      clientId,
      title,
      description,
      objective,
      startDate,
      endDate,
      notes,
      exercises,
    } = req.body

    if (!clientId || !title) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'Cliente y título son obligatorios',
      })
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message:
          'La fecha final no puede ser anterior al inicio',
      })
    }

    const exercisesError = validateExercises(exercises)

    if (exercisesError) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: exercisesError,
      })
    }

    const client = await Client.findByPk(clientId, { transaction })

    if (!client) {
      await transaction.rollback()

      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    const lastRoutine = await Routine.findOne({
      where: { clientId },
      order: [['version', 'DESC']],
      transaction,
    })

    const nextVersion = lastRoutine ? lastRoutine.version + 1 : 1

    await Routine.update(
      { active: false },
      {
        where: {
          clientId,
          active: true,
        },
        transaction,
      },
    )

    const routine = await Routine.create(
      {
        clientId,
        version: nextVersion,
        title,
        description: description ?? null,
        objective: objective ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        notes: notes ?? null,
        active: true,
      },
      { transaction },
    )

    const exerciseRecords = exercises.map((exercise, index) => ({
      routineId: routine.id,
      order: exercise.order ?? index + 1,
      dayOfWeek: exercise.dayOfWeek ?? null,
      exerciseName: exercise.exerciseName,
      series: exercise.series,
      amount: exercise.amount,
      unit: exercise.unit,
      notes: exercise.notes ?? null,
    }))

    await RoutineExercise.bulkCreate(exerciseRecords, { transaction })

    await transaction.commit()

    const createdRoutine = await Routine.findByPk(routine.id, {
      include: routineInclude,
    })

    return res.status(201).json({
      ok: true,
      message: 'Rutina creada y activada correctamente',
      routine: createdRoutine,
    })
  } catch (error) {
    await transaction.rollback()
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al crear rutina',
    })
  }
}

export async function listRoutinesByClient(req, res) {
  try {
    const clientId = Number(req.params.clientId)
    const { page, limit, offset } =
      getPagination(req.query)

    if (
      !Number.isInteger(clientId) ||
      clientId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El cliente indicado no es válido',
      })
    }

    const client = await Client.findByPk(clientId)

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    const [
      currentRoutine,
      historyResult,
    ] = await Promise.all([
      Routine.findOne({
        where: {
          clientId,
          active: true,
        },
        include: routineInclude,
        order: [['version', 'DESC']],
      }),

      Routine.findAndCountAll({
        where: {
          clientId,
          active: false,
        },
        include: routineInclude,
        order: [['version', 'DESC']],
        limit,
        offset,
        distinct: true,
      }),
    ])

    return res.json({
      ok: true,
      currentRoutine,
      history: historyResult.rows,
      pagination: buildPagination({
        page,
        limit,
        total: historyResult.count,
      }),
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al listar rutinas',
    })
  }
}

export async function listMyRoutines(req, res) {
  try {
    const { page, limit, offset } =
      getPagination(req.query)

    const client = await Client.findOne({
      where: {
        userId: req.user.id,
      },
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message:
          'Perfil de cliente no encontrado',
      })
    }

    const [
      currentRoutine,
      historyResult,
    ] = await Promise.all([
      Routine.findOne({
        where: {
          clientId: client.id,
          active: true,
        },
        include: routineInclude,
        order: [['version', 'DESC']],
      }),

      Routine.findAndCountAll({
        where: {
          clientId: client.id,
          active: false,
        },
        include: routineInclude,
        order: [['version', 'DESC']],
        limit,
        offset,
        distinct: true,
      }),
    ])

    return res.json({
      ok: true,
      currentRoutine,
      history: historyResult.rows,
      pagination: buildPagination({
        page,
        limit,
        total: historyResult.count,
      }),
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al listar tus rutinas',
    })
  }
}

export async function deactivateRoutine(req, res) {
  try {
    const { id } = req.params

    const routine = await Routine.findByPk(id)

    if (!routine) {
      return res.status(404).json({
        ok: false,
        message: 'Rutina no encontrada',
      })
    }

    if (!routine.active) {
      return res.status(400).json({
        ok: false,
        message: 'La rutina ya se encuentra inactiva',
      })
    }

    routine.active = false
    await routine.save()

    return res.json({
      ok: true,
      message:
        'Rutina desactivada. El cliente quedó sin rutina actual y la rutina pasó al historial.',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al desactivar rutina',
    })
  }
}

export async function activateRoutine(req, res) {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params

    const routine = await Routine.findByPk(id, { transaction })

    if (!routine) {
      await transaction.rollback()

      return res.status(404).json({
        ok: false,
        message: 'Rutina no encontrada',
      })
    }

    await Routine.update(
      { active: false },
      {
        where: {
          clientId: routine.clientId,
          active: true,
        },
        transaction,
      },
    )

    routine.active = true
    await routine.save({ transaction })

    await transaction.commit()

    const activatedRoutine = await Routine.findByPk(routine.id, {
      include: routineInclude,
    })

    return res.json({
      ok: true,
      message: 'Rutina activada correctamente',
      routine: activatedRoutine,
    })
  } catch (error) {
    await transaction.rollback()
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al activar rutina',
    })
  }
}

export async function updateRoutine(req, res) {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params

    const {
      title,
      description,
      objective,
      startDate,
      endDate,
      notes,
      exercises,
    } = req.body

    if (!title) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'El título es obligatorio',
      })
    }

    if (startDate && endDate && endDate < startDate) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'La fecha final no puede ser anterior al inicio',
      })
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message:
          'La fecha final no puede ser anterior al inicio',
      })
    }

    const exercisesError = validateExercises(exercises)

    if (exercisesError) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: exercisesError,
      })
    }

    const routine = await Routine.findByPk(id, { transaction })

    if (!routine) {
      await transaction.rollback()

      return res.status(404).json({
        ok: false,
        message: 'Rutina no encontrada',
      })
    }

    if (!routine.active) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'Las rutinas históricas no pueden editarse',
      })
    }

    await routine.update(
      {
        title,
        description: description ?? null,
        objective: objective ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        notes: notes ?? null,
      },
      { transaction },
    )

    await RoutineExercise.destroy({
      where: {
        routineId: routine.id,
      },
      transaction,
    })

    const exerciseRecords = exercises.map((exercise, index) => ({
      routineId: routine.id,
      order: exercise.order ?? index + 1,
      dayOfWeek: exercise.dayOfWeek ?? null,
      exerciseName: exercise.exerciseName,
      series: exercise.series,
      amount: exercise.amount,
      unit: exercise.unit,
      notes: exercise.notes ?? null,
    }))

    await RoutineExercise.bulkCreate(exerciseRecords, {
      transaction,
    })

    await transaction.commit()

    const updatedRoutine = await Routine.findByPk(routine.id, {
      include: routineInclude,
    })

    return res.json({
      ok: true,
      message: 'Rutina actualizada correctamente',
      routine: updatedRoutine,
    })
  } catch (error) {
    await transaction.rollback()
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar la rutina',
    })
  }
}




