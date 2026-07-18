import { Op } from 'sequelize'
import { Notification } from './notification.model.js'

const ALLOWED_STATUSES = new Set([
  'all',
  'pending',
  'unread',
  'read',
  'attended',
  'resolved',
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
      : 10

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  }
}

function getStatusFilter(status) {
  switch (status) {
    case 'all':
      return {}

    case 'unread':
      return {
        readAt: null,
        attendedAt: null,
        resolvedAt: null,
      }

    case 'read':
      return {
        readAt: {
          [Op.ne]: null,
        },
        attendedAt: null,
        resolvedAt: null,
      }

    case 'attended':
      return {
        attendedAt: {
          [Op.ne]: null,
        },
      }

    case 'resolved':
      return {
        resolvedAt: {
          [Op.ne]: null,
        },
      }

    case 'pending':
    default:
      return {
        attendedAt: null,
        resolvedAt: null,
      }
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

function parseNotificationId(value) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0
    ? id
    : null
}

async function findUserNotification(
  notificationId,
  recipientUserId,
) {
  return Notification.findOne({
    where: {
      id: notificationId,
      recipientUserId,
    },
  })
}

export async function listNotifications(
  req,
  res,
) {
  try {
    const { page, limit, offset } =
      getPagination(req.query)

    const requestedStatus =
      typeof req.query.status === 'string'
        ? req.query.status
            .trim()
            .toLowerCase()
        : 'pending'

    const status =
      ALLOWED_STATUSES.has(requestedStatus)
        ? requestedStatus
        : 'pending'

    const { count, rows } =
      await Notification.findAndCountAll({
        where: {
          recipientUserId: req.user.id,
          ...getStatusFilter(status),
        },

        order: [
          ['createdAt', 'DESC'],
          ['id', 'DESC'],
        ],

        limit,
        offset,
      })

    return res.json({
      ok: true,
      notifications: rows,
      filter: status,
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
        'Error al listar las notificaciones',
    })
  }
}

export async function getNotificationSummary(
  req,
  res,
) {
  try {
    const recipientUserId = req.user.id

    const [
      total,
      unread,
      pending,
      attended,
      resolved,
    ] = await Promise.all([
      Notification.count({
        where: {
          recipientUserId,
        },
      }),

      Notification.count({
        where: {
          recipientUserId,
          readAt: null,
          attendedAt: null,
          resolvedAt: null,
        },
      }),

      Notification.count({
        where: {
          recipientUserId,
          attendedAt: null,
          resolvedAt: null,
        },
      }),

      Notification.count({
        where: {
          recipientUserId,
          attendedAt: {
            [Op.ne]: null,
          },
        },
      }),

      Notification.count({
        where: {
          recipientUserId,
          resolvedAt: {
            [Op.ne]: null,
          },
        },
      }),
    ])

    return res.json({
      ok: true,
      summary: {
        total,
        unread,
        pending,
        attended,
        resolved,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al obtener el resumen de notificaciones',
    })
  }
}

export async function markNotificationAsRead(
  req,
  res,
) {
  try {
    const notificationId =
      parseNotificationId(req.params.id)

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message:
          'La notificación indicada no es válida',
      })
    }

    const notification =
      await findUserNotification(
        notificationId,
        req.user.id,
      )

    if (!notification) {
      return res.status(404).json({
        ok: false,
        message:
          'Notificación no encontrada',
      })
    }

    if (!notification.readAt) {
      notification.readAt = new Date()

      await notification.save()
    }

    return res.json({
      ok: true,
      message:
        'Notificación marcada como leída',
      notification,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al marcar la notificación como leída',
    })
  }
}

export async function markAllNotificationsAsRead(
  req,
  res,
) {
  try {
    const [updatedCount] =
      await Notification.update(
        {
          readAt: new Date(),
        },
        {
          where: {
            recipientUserId: req.user.id,
            readAt: null,
          },
        },
      )

    return res.json({
      ok: true,
      message:
        'Todas las notificaciones fueron marcadas como leídas',
      updatedCount,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al marcar las notificaciones como leídas',
    })
  }
}

export async function attendNotification(
  req,
  res,
) {
  try {
    const notificationId =
      parseNotificationId(req.params.id)

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message:
          'La notificación indicada no es válida',
      })
    }

    const notification =
      await findUserNotification(
        notificationId,
        req.user.id,
      )

    if (!notification) {
      return res.status(404).json({
        ok: false,
        message:
          'Notificación no encontrada',
      })
    }

    if (
      notification.category ===
      'condition'
    ) {
      return res.status(409).json({
        ok: false,
        message:
          'Las alertas por condición se resuelven automáticamente cuando deja de existir el problema',
      })
    }

    if (notification.resolvedAt) {
      return res.status(409).json({
        ok: false,
        message:
          'La notificación ya fue resuelta automáticamente',
      })
    }

    if (!notification.attendedAt) {
      const now = new Date()

      notification.readAt =
        notification.readAt || now

      notification.attendedAt = now
      notification.resolutionType =
        'manual'

      await notification.save()
    }

    return res.json({
      ok: true,
      message:
        'Notificación marcada como atendida',
      notification,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al atender la notificación',
    })
  }
}

export async function reopenNotification(
  req,
  res,
) {
  try {
    const notificationId =
      parseNotificationId(req.params.id)

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message:
          'La notificación indicada no es válida',
      })
    }

    const notification =
      await findUserNotification(
        notificationId,
        req.user.id,
      )

    if (!notification) {
      return res.status(404).json({
        ok: false,
        message:
          'Notificación no encontrada',
      })
    }

    if (
      notification.category ===
      'condition'
    ) {
      return res.status(409).json({
        ok: false,
        message:
          'Las alertas automáticas no pueden reabrirse manualmente',
      })
    }

    if (!notification.attendedAt) {
      return res.status(409).json({
        ok: false,
        message:
          'La notificación no está marcada como atendida',
      })
    }

    notification.attendedAt = null
    notification.resolutionType = null

    await notification.save()

    return res.json({
      ok: true,
      message:
        'Notificación reabierta correctamente',
      notification,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al reabrir la notificación',
    })
  }
}
