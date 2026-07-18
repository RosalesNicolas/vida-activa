import { Op } from 'sequelize'
import bcrypt from 'bcryptjs'
import { sequelize } from '../../database/connection.js'
import { User } from '../users/user.model.js'
import { Client } from './client.model.js'
import { createEventNotificationForAdmins } from '../notifications/notification.service.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_SEX_VALUES = [
  '',
  'female',
  'male',
  'other',
  'preferNotToSay',
]

function normalizeRequiredText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeOptionalText(value) {
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  return normalized || null
}

function normalizeEmail(value) {
  return normalizeRequiredText(value).toLowerCase()
}

function normalizeNullableDate(value) {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null
}

function calculateAge(birthDate) {
  if (!birthDate) return null

  const today = new Date()
  const birth = new Date(`${birthDate}T00:00:00`)

  let age = today.getFullYear() - birth.getFullYear()
  const monthDifference = today.getMonth() - birth.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1
  }

  return age
}

function normalizeHeight(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  return Number(value)
}

function isFutureDate(value) {
  if (!value) return false

  return new Date(`${value}T00:00:00`) > new Date()
}

export async function listClients(req, res) {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10)
    const requestedLimit = Number.parseInt(req.query.limit, 10)

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10

    const offset = (page - 1) * limit

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : ''

    const status = ['active', 'inactive'].includes(req.query.status)
      ? req.query.status
      : 'all'

    const clientWhere = {}
    const userWhere = {}

    if (search) {
      clientWhere[Op.or] = [
        {
          objective: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          '$user.name$': {
            [Op.like]: `%${search}%`,
          },
        },
        {
          '$user.email$': {
            [Op.like]: `%${search}%`,
          },
        },
      ]
    }

    if (status === 'active') {
      userWhere.active = true
    }

    if (status === 'inactive') {
      userWhere.active = false
    }

    const hasUserFilter = Object.keys(userWhere).length > 0

    const { count, rows } = await Client.findAndCountAll({
      where: clientWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'active'],
          where: hasUserFilter ? userWhere : undefined,
          required: hasUserFilter,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    })

    return res.json({
      ok: true,
      clients: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al listar clientes',
    })
  }
}

export async function getClientById(req, res) {
  try {
    const { id } = req.params

    const client = await Client.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'active'],
        },
      ],
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    return res.json({
      ok: true,
      client,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener cliente',
    })
  }
}

export async function getMyClientProfile(req, res) {
  try {
    const client = await Client.findOne({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'active'],
        },
      ],
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Perfil de cliente no encontrado',
      })
    }

    return res.json({
      ok: true,
      client,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener el perfil del cliente',
    })
  }
}

export async function createClient(req, res) {
  const transaction = await sequelize.transaction()

  try {
    const name = normalizeRequiredText(req.body.name)
    const email = normalizeEmail(req.body.email)
    const password =
      typeof req.body.password === 'string' ? req.body.password : ''
    const startDate = normalizeNullableDate(req.body.startDate)

    if (!name || !email || !password) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'Nombre, email y contraseña son obligatorios',
      })
    }

    if (!EMAIL_PATTERN.test(email)) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'El email no tiene un formato válido',
      })
    }

    const existingUser = await User.findOne({
      where: { email },
      transaction,
    })

    if (existingUser) {
      await transaction.rollback()

      return res.status(409).json({
        ok: false,
        message: 'Ya existe un usuario con ese email',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create(
      {
        name,
        email,
        passwordHash,
        role: 'client',
        active: true,
      },
      { transaction },
    )

    const client = await Client.create(
      {
        userId: user.id,
        age: req.body.age || null,
        height: req.body.height || null,
        objective: normalizeOptionalText(req.body.objective),
        observations: normalizeOptionalText(req.body.observations),
        startDate,
      },
      { transaction },
    )

    await transaction.commit()

    return res.status(201).json({
      ok: true,
      message: 'Cliente creado correctamente',
      client: {
        id: client.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: client.age,
        height: client.height,
        objective: client.objective,
        observations: client.observations,
        startDate: client.startDate,
      },
    })
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback()
    }

    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al crear cliente',
    })
  }
}

export async function updateClient(req, res) {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params

    const client = await Client.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
      transaction,
    })

    if (!client) {
      await transaction.rollback()

      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    const name = normalizeRequiredText(req.body.name)
    const email = normalizeEmail(req.body.email)
    const diseases = normalizeRequiredText(req.body.diseases)

    if (!name || !email || !diseases) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message:
          'Nombre, email y enfermedades son obligatorios. Si no posee enfermedades, indicá "Ninguna".',
      })
    }

    if (!EMAIL_PATTERN.test(email)) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'El email no tiene un formato válido',
      })
    }

    if (email !== client.user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: {
            [Op.ne]: client.user.id,
          },
        },
        transaction,
      })

      if (existingUser) {
        await transaction.rollback()

        return res.status(409).json({
          ok: false,
          message: 'Ya existe un usuario con ese email',
        })
      }
    }

    const sex =
      typeof req.body.sex === 'string' ? req.body.sex : ''

    if (!ALLOWED_SEX_VALUES.includes(sex)) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'El valor indicado para sexo no es válido',
      })
    }

    const height = normalizeHeight(req.body.height)

    if (
      height !== null &&
      (!Number.isFinite(height) || height <= 0)
    ) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'La altura debe ser mayor que cero',
      })
    }

    const birthDate = normalizeNullableDate(req.body.birthDate)
    const startDate = normalizeNullableDate(req.body.startDate)

    if (isFutureDate(birthDate)) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'La fecha de nacimiento no puede estar en el futuro',
      })
    }

    client.user.name = name
    client.user.email = email

    client.age = calculateAge(birthDate)
    client.height = height
    client.phone = normalizeOptionalText(req.body.phone)
    client.birthDate = birthDate
    client.sex = sex || null
    client.address = normalizeOptionalText(req.body.address)
    client.occupation = normalizeOptionalText(req.body.occupation)
    client.objective = normalizeOptionalText(req.body.objective)
    client.injuries = normalizeOptionalText(req.body.injuries)
    client.diseases = diseases
    client.medications = normalizeOptionalText(req.body.medications)
    client.emergencyContactName = normalizeOptionalText(
      req.body.emergencyContactName,
    )
    client.emergencyContactPhone = normalizeOptionalText(
      req.body.emergencyContactPhone,
    )
    client.observations = normalizeOptionalText(req.body.observations)
    client.startDate = startDate

    await client.user.save({ transaction })
    await client.save({ transaction })

    await transaction.commit()

    return res.json({
      ok: true,
      message: 'Cliente actualizado correctamente',
      client,
    })
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback()
    }

    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar cliente',
    })
  }
}

export async function deactivateClient(req, res) {
  try {
    const { id } = req.params

    const client = await Client.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    client.user.active = false
    await client.user.save()

    return res.json({
      ok: true,
      message: 'Cliente desactivado correctamente',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al desactivar cliente',
    })
  }
}

export async function activateClient(req, res) {
  try {
    const { id } = req.params

    const client = await Client.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    client.user.active = true
    await client.user.save()

    return res.json({
      ok: true,
      message: 'Cliente reactivado correctamente',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al reactivar cliente',
    })
  }
}

export async function updateMyClientProfile(req, res) {
  const transaction = await sequelize.transaction()

  try {
    const client = await Client.findOne({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
      transaction,
    })

    if (!client) {
      await transaction.rollback()

      return res.status(404).json({
        ok: false,
        message: 'Perfil de cliente no encontrado',
      })
    }

    const name = normalizeRequiredText(req.body.name)
    const email = normalizeEmail(req.body.email)
    const diseases = normalizeRequiredText(req.body.diseases)

    if (!name || !email || !diseases) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message:
          'Nombre, email y enfermedades son obligatorios. Si no tenés enfermedades, escribí "Ninguna".',
      })
    }

    if (!EMAIL_PATTERN.test(email)) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'El email no tiene un formato válido',
      })
    }

    if (email !== client.user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: {
            [Op.ne]: client.user.id,
          },
        },
        transaction,
      })

      if (existingUser) {
        await transaction.rollback()

        return res.status(409).json({
          ok: false,
          message: 'Ya existe un usuario con ese email',
        })
      }
    }

    const sex =
      typeof req.body.sex === 'string' ? req.body.sex : ''

    if (!ALLOWED_SEX_VALUES.includes(sex)) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'El valor indicado para sexo no es válido',
      })
    }

    const height = normalizeHeight(req.body.height)

    if (
      height !== null &&
      (!Number.isFinite(height) || height <= 0)
    ) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'La altura debe ser un número mayor que cero',
      })
    }

    const birthDate = normalizeNullableDate(req.body.birthDate)

    if (isFutureDate(birthDate)) {
      await transaction.rollback()

      return res.status(400).json({
        ok: false,
        message: 'La fecha de nacimiento no puede estar en el futuro',
      })
    }

    client.user.name = name
    client.user.email = email

    client.age = calculateAge(birthDate)
    client.phone = normalizeOptionalText(req.body.phone)
    client.birthDate = birthDate
    client.sex = sex || null
    client.address = normalizeOptionalText(req.body.address)
    client.occupation = normalizeOptionalText(req.body.occupation)
    client.height = height
    client.objective = normalizeOptionalText(req.body.objective)
    client.injuries = normalizeOptionalText(req.body.injuries)
    client.diseases = diseases
    client.medications = normalizeOptionalText(req.body.medications)
    client.emergencyContactName = normalizeOptionalText(
      req.body.emergencyContactName,
    )
    client.emergencyContactPhone = normalizeOptionalText(
      req.body.emergencyContactPhone,
    )
    client.observations = normalizeOptionalText(req.body.observations)

    await client.user.save({ transaction })
    await client.save({ transaction })

    await transaction.commit()

    try {
      const clientName =
        client.user?.name || 'Un cliente'

      await createEventNotificationForAdmins({
        clientId: client.id,
        type: 'client_profile_updated',
        title: 'Perfil actualizado',
        message:
          `${clientName} actualizó los datos de su perfil.`,
        actionUrl:
          `/admin/clients/${client.id}`,
      })
    } catch (notificationError) {
      console.error(
        'El perfil se actualizó, pero no pudo crearse la notificación:',
        notificationError,
      )
    }

    return res.json({
      ok: true,
      message: 'Perfil actualizado correctamente',
      client,
    })
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback()
    }

    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar el perfil',
    })
  }
}
