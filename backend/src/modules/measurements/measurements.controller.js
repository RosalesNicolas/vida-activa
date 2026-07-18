import { Client } from '../clients/client.model.js'
import { User } from '../users/user.model.js'
import { Measurement } from './measurement.model.js'
import { createEventNotificationForAdmins } from '../notifications/notification.service.js'

function buildMeasurementPayload(data, clientId) {
  return {
    clientId,
    date: data.date,
    weight: data.weight ?? null,
    waist: data.waist ?? null,
    hip: data.hip ?? null,
    chest: data.chest ?? null,
    arm: data.arm ?? null,
    leg: data.leg ?? null,
    bodyFatPercentage: data.bodyFatPercentage ?? null,
    notes: data.notes ?? null,
  }
}

const requiredMeasurementFields = [
  'date',
  'weight',
  'waist',
  'hip',
  'chest',
  'arm',
  'leg',
  'bodyFatPercentage',
]

function validateMeasurementData(data) {
  const missingField = requiredMeasurementFields.find(
    (field) =>
      data[field] === undefined ||
      data[field] === null ||
      data[field] === '',
  )

  if (missingField) {
    return 'Todos los campos físicos son obligatorios'
  }

  const numericFields = [
    'weight',
    'waist',
    'hip',
    'chest',
    'arm',
    'leg',
    'bodyFatPercentage',
  ]

  const invalidField = numericFields.find(
    (field) =>
      !Number.isFinite(Number(data[field])) ||
      Number(data[field]) <= 0,
  )

  if (invalidField) {
    return 'Las mediciones deben ser números mayores que cero'
  }

  return null
}

async function userCanAccessMeasurement(user, measurement) {
  if (user.role === 'admin') {
    return true
  }

  if (user.role === 'client') {
    const client = await Client.findOne({
      where: {
        userId: user.id,
      },
    })

    if (!client) {
      return false
    }

    return measurement.clientId === client.id
  }

  return false
}

export async function createMeasurement(req, res) {
  try {
    const { clientId } = req.body

    if (!clientId) {
      return res.status(400).json({
        ok: false,
        message: 'El cliente es obligatorio',
      })
    }

    const validationError = validateMeasurementData(req.body)

    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError,
      })
    }

    const client = await Client.findByPk(clientId)

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    const measurement = await Measurement.create(
      buildMeasurementPayload(req.body, clientId),
    )

    return res.status(201).json({
      ok: true,
      message: 'Medición creada correctamente por administrador',
      measurement,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al crear medición',
    })
  }
}

export async function createMyMeasurement(req, res) {
  try {
    const validationError =
      validateMeasurementData(req.body)

    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError,
      })
    }

    const client = await Client.findOne({
      where: {
        userId: req.user.id,
      },

      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message:
          'Perfil de cliente no encontrado',
      })
    }

    const measurement =
      await Measurement.create(
        buildMeasurementPayload(
          req.body,
          client.id,
        ),
      )

    try {
      const clientName =
        client.user?.name || 'Un cliente'

      await createEventNotificationForAdmins({
        clientId: client.id,
        type: 'client_measurement_created',
        title: 'Nueva medición registrada',
        message:
          `${clientName} registró una nueva medición con fecha ${measurement.date}.`,
        actionUrl:
          `/admin/clients/${client.id}`,
      })
    } catch (notificationError) {
      console.error(
        'La medición se guardó, pero no pudo crearse la notificación:',
        notificationError,
      )
    }

    return res.status(201).json({
      ok: true,
      message:
        'Medición propia creada correctamente',
      measurement,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al crear tu medición',
    })
  }
}


export async function listMeasurementsByClient(req, res) {
  try {
    const { clientId } = req.params

    const requestedPage = Number.parseInt(
      req.query.page,
      10,
    )

    const requestedLimit = Number.parseInt(
      req.query.limit,
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
        : 10

    const offset = (page - 1) * limit

    const client = await Client.findByPk(clientId)

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    const { count, rows } =
      await Measurement.findAndCountAll({
        where: { clientId },
        order: [['date', 'DESC']],
        limit,
        offset,
      })

    return res.json({
      ok: true,
      measurements: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.max(
          1,
          Math.ceil(count / limit),
        ),
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al listar mediciones',
    })
  }
}

export async function listMyMeasurements(req, res) {
  try {
    const requestedPage = Number.parseInt(
      req.query.page,
      10,
    )

    const requestedLimit = Number.parseInt(
      req.query.limit,
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
        : 10

    const offset = (page - 1) * limit

    const client = await Client.findOne({
      where: {
        userId: req.user.id,
      },
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Perfil de cliente no encontrado',
      })
    }

    const { count, rows } =
      await Measurement.findAndCountAll({
        where: {
          clientId: client.id,
        },
        order: [['date', 'DESC']],
        limit,
        offset,
      })

    return res.json({
      ok: true,
      measurements: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.max(
          1,
          Math.ceil(count / limit),
        ),
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al listar tus mediciones',
    })
  }
}

export async function updateMeasurement(req, res) {
  try {
    const { id } = req.params

    const measurement = await Measurement.findByPk(id)

    if (!measurement) {
      return res.status(404).json({
        ok: false,
        message: 'Medición no encontrada',
      })
    }

    const canAccess = await userCanAccessMeasurement(
      req.user,
      measurement,
    )

    if (!canAccess) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para editar esta medición',
      })
    }

    const updatedData = {
      date:
        req.body.date ??
        measurement.date,
      weight:
        req.body.weight ??
        measurement.weight,
      waist:
        req.body.waist ??
        measurement.waist,
      hip:
        req.body.hip ??
        measurement.hip,
      chest:
        req.body.chest ??
        measurement.chest,
      arm:
        req.body.arm ??
        measurement.arm,
      leg:
        req.body.leg ??
        measurement.leg,
      bodyFatPercentage:
        req.body.bodyFatPercentage ??
        measurement.bodyFatPercentage,
      notes: Object.prototype.hasOwnProperty.call(
        req.body,
        'notes',
      )
        ? req.body.notes
        : measurement.notes,
    }

    const validationError =
      validateMeasurementData(updatedData)

    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError,
      })
    }

    await measurement.update(updatedData)

    return res.json({
      ok: true,
      message: 'Medición actualizada correctamente',
      measurement,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar medición',
    })
  }
}

export async function deleteMeasurement(req, res) {
  try {
    const { id } = req.params

    const measurement = await Measurement.findByPk(id)

    if (!measurement) {
      return res.status(404).json({
        ok: false,
        message: 'Medición no encontrada',
      })
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        ok: false,
        message: 'Solo el administrador puede eliminar mediciones',
      })
    }

    await measurement.destroy()

    return res.json({
      ok: true,
      message: 'Medición eliminada correctamente',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al eliminar medición',
    })
  }
}











export async function listMeasurementEvolutionByClient(req, res) {
  try {
    const { clientId } = req.params

    const client = await Client.findByPk(clientId)

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    const evolution = await Measurement.findAll({
      where: {
        clientId,
      },
      attributes: [
        'id',
        'date',
        'weight',
        'waist',
        'hip',
        'bodyFatPercentage',
      ],
      order: [
        ['date', 'ASC'],
        ['id', 'ASC'],
      ],
    })

    return res.json({
      ok: true,
      evolution,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener la evolución del cliente',
    })
  }
}

export async function listMyMeasurementEvolution(req, res) {
  try {
    const client = await Client.findOne({
      where: {
        userId: req.user.id,
      },
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Perfil de cliente no encontrado',
      })
    }

    const evolution = await Measurement.findAll({
      where: {
        clientId: client.id,
      },
      attributes: [
        'id',
        'date',
        'weight',
        'waist',
        'hip',
        'bodyFatPercentage',
      ],
      order: [
        ['date', 'ASC'],
        ['id', 'ASC'],
      ],
    })

    return res.json({
      ok: true,
      evolution,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener tu evolución',
    })
  }
}

export async function getMeasurementById(req, res) {
  try {
    const { id } = req.params

    const measurement = await Measurement.findByPk(id)

    if (!measurement) {
      return res.status(404).json({
        ok: false,
        message: 'Medición no encontrada',
      })
    }

    const canAccess = await userCanAccessMeasurement(
      req.user,
      measurement,
    )

    if (!canAccess) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para consultar esta medición',
      })
    }

    return res.json({
      ok: true,
      measurement,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener la medición',
    })
  }
}
