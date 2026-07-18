import { Client } from '../clients/client.model.js'
import { User } from '../users/user.model.js'
import { Progress } from './progress.model.js'
import { createEventNotificationForAdmins } from '../notifications/notification.service.js'

const ALLOWED_STATUSES = new Set([
  'positivo',
  'en_proceso',
  'requiere_atencion',
  'finalizado',
  'pendiente',
  'cumplido',
  'completado',
])

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

function normalizeRequiredText(value) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function normalizeStatus(value) {
  return normalizeRequiredText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizeOptionalText(value) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()

  return normalized || null
}

function isValidDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  )
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

export async function createProgressNote(req, res) {
  try {
    const clientId = Number(req.body.clientId)

    const date = normalizeRequiredText(
      req.body.date,
    )

    const title = normalizeRequiredText(
      req.body.title,
    )

    const comment = normalizeRequiredText(
      req.body.comment,
    )

    const status =
      normalizeStatus(req.body.status) ||
      'en_proceso'

    if (
      !Number.isInteger(clientId) ||
      clientId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El cliente indicado no es válido',
      })
    }

    if (!date || !title || !comment) {
      return res.status(400).json({
        ok: false,
        message:
          'Cliente, fecha, título y comentario son obligatorios',
      })
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        ok: false,
        message: 'La fecha no tiene un formato válido',
      })
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({
        ok: false,
        message:
          'El estado del seguimiento no es válido',
      })
    }

    const client = await Client.findByPk(clientId)

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Cliente no encontrado',
      })
    }

    const progressNote = await Progress.create({
      clientId,
      date,
      title,
      comment,
      status,
      nextAction: normalizeOptionalText(
        req.body.nextAction,
      ),
      visibleToClient:
        typeof req.body.visibleToClient ===
        'boolean'
          ? req.body.visibleToClient
          : true,
    })

    return res.status(201).json({
      ok: true,
      message:
        'Nota de progreso creada correctamente',
      progressNote,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al crear nota de progreso',
    })
  }
}

export async function listProgressByClient(
  req,
  res,
) {
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

    const { count, rows } =
      await Progress.findAndCountAll({
        where: {
          clientId,
        },

        order: [
          ['date', 'DESC'],
          ['id', 'DESC'],
        ],

        limit,
        offset,
      })

    return res.json({
      ok: true,
      progressNotes: rows,
      pagination: buildPagination({
        page,
        limit,
        total: count,
      }),
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al listar notas de progreso',
    })
  }
}

export async function listMyProgress(req, res) {
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

    const { count, rows } =
      await Progress.findAndCountAll({
        where: {
          clientId: client.id,
          visibleToClient: true,
        },

        order: [
          ['date', 'DESC'],
          ['id', 'DESC'],
        ],

        limit,
        offset,
      })

    return res.json({
      ok: true,
      progressNotes: rows,
      pagination: buildPagination({
        page,
        limit,
        total: count,
      }),
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message: 'Error al listar tu progreso',
    })
  }
}

export async function updateProgressNote(
  req,
  res,
) {
  try {
    const { id } = req.params

    const progressNote =
      await Progress.findByPk(id)

    if (!progressNote) {
      return res.status(404).json({
        ok: false,
        message:
          'Nota de seguimiento no encontrada',
      })
    }

    const hasField = (field) =>
      Object.prototype.hasOwnProperty.call(
        req.body,
        field,
      )

    const date = hasField('date')
      ? normalizeRequiredText(req.body.date)
      : progressNote.date

    const title = hasField('title')
      ? normalizeRequiredText(req.body.title)
      : progressNote.title

    const comment = hasField('comment')
      ? normalizeRequiredText(req.body.comment)
      : progressNote.comment

    const status = hasField('status')
      ? normalizeStatus(req.body.status)
      : normalizeStatus(progressNote.status)

    if (!date || !title || !comment) {
      return res.status(400).json({
        ok: false,
        message:
          'Fecha, título y comentario son obligatorios',
      })
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        ok: false,
        message: 'La fecha no tiene un formato válido',
      })
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({
        ok: false,
        message:
          'El estado del seguimiento no es válido',
      })
    }

    if (
      hasField('visibleToClient') &&
      typeof req.body.visibleToClient !==
        'boolean'
    ) {
      return res.status(400).json({
        ok: false,
        message:
          'La visibilidad del seguimiento no es válida',
      })
    }

    progressNote.date = date
    progressNote.title = title
    progressNote.comment = comment
    progressNote.status = status

    if (hasField('nextAction')) {
      progressNote.nextAction =
        normalizeOptionalText(
          req.body.nextAction,
        )
    }

    if (hasField('visibleToClient')) {
      progressNote.visibleToClient =
        req.body.visibleToClient
    }

    await progressNote.save()

    return res.json({
      ok: true,
      message:
        'Nota de seguimiento actualizada correctamente',
      progressNote,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al actualizar la nota de seguimiento',
    })
  }
}

export async function updateClientComment(
  req,
  res,
) {
  try {
    const { id } = req.params
    const { clientComment } = req.body

    if (typeof clientComment !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'La respuesta debe ser texto',
      })
    }

    const normalizedComment =
      clientComment.trim()

    if (!normalizedComment) {
      return res.status(400).json({
        ok: false,
        message:
          'La respuesta no puede estar vacía',
      })
    }

    if (normalizedComment.length > 500) {
      return res.status(400).json({
        ok: false,
        message:
          'La respuesta no puede superar los 500 caracteres',
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

    const progressNote =
      await Progress.findOne({
        where: {
          id,
          clientId: client.id,
          visibleToClient: true,
        },
      })

    if (!progressNote) {
      return res.status(404).json({
        ok: false,
        message:
          'Nota de seguimiento no encontrada',
      })
    }

    if (
      progressNote.clientComment &&
      progressNote.clientCommentEditable ===
        false
    ) {
      return res.status(409).json({
        ok: false,
        message:
          'La respuesta ya fue enviada. Felipe debe habilitar la edición para modificarla.',
      })
    }

    progressNote.clientComment =
      normalizedComment

    progressNote.clientCommentEditable =
      false

    await progressNote.save()

    try {
      const clientName =
        client.user?.name || 'Un cliente'

      await createEventNotificationForAdmins({
        clientId: client.id,
        type: 'progress_response',
        title:
          'Nueva respuesta de seguimiento',
        message:
          `${clientName} respondió el seguimiento "${progressNote.title}".`,
        actionUrl:
          `/admin/clients/${client.id}`,
      })
    } catch (notificationError) {
      console.error(
        'La respuesta se guardó, pero no pudo crearse la notificación:',
        notificationError,
      )
    }

    return res.json({
      ok: true,
      message:
        'Respuesta enviada correctamente',
      progressNote,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al guardar la respuesta',
    })
  }
}


export async function setClientCommentEditing(
  req,
  res,
) {
  try {
    const { id } = req.params
    const { enabled } = req.body

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        ok: false,
        message:
          'El permiso de edición no es válido',
      })
    }

    const progressNote =
      await Progress.findByPk(id)

    if (!progressNote) {
      return res.status(404).json({
        ok: false,
        message:
          'Nota de seguimiento no encontrada',
      })
    }

    progressNote.clientCommentEditable =
      enabled

    await progressNote.save()

    return res.json({
      ok: true,
      message: enabled
        ? 'Edición habilitada para el cliente'
        : 'Edición bloqueada para el cliente',
      progressNote,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al cambiar el permiso de edición',
    })
  }
}


