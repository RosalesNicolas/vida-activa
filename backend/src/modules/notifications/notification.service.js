import { User } from '../users/user.model.js'
import { Notification } from './notification.model.js'

async function getActiveAdminIds(
  transaction,
) {
  const admins = await User.findAll({
    where: {
      role: 'admin',
      active: true,
    },

    attributes: ['id'],
    transaction,
  })

  return admins.map((admin) => admin.id)
}

export function buildConditionKey(
  type,
  clientId,
  extra = 'current',
) {
  return [
    type,
    clientId,
    extra,
  ].join(':')
}

export async function createEventNotificationForAdmins({
  clientId = null,
  type,
  title,
  message,
  actionUrl = null,
  transaction,
}) {
  const adminIds =
    await getActiveAdminIds(transaction)

  if (adminIds.length === 0) {
    return []
  }

  return Notification.bulkCreate(
    adminIds.map((recipientUserId) => ({
      recipientUserId,
      clientId,
      type,
      category: 'event',
      title,
      message,
      actionUrl,
      conditionKey: null,
    })),
    {
      transaction,
    },
  )
}

export async function syncConditionNotificationForAdmins({
  clientId,
  type,
  title,
  message,
  actionUrl = null,
  conditionKey,
  transaction,
}) {
  const adminIds =
    await getActiveAdminIds(transaction)

  const notifications = []

  for (const recipientUserId of adminIds) {
    const existing =
      await Notification.findOne({
        where: {
          recipientUserId,
          conditionKey,
        },
        transaction,
      })

    if (!existing) {
      const notification =
        await Notification.create(
          {
            recipientUserId,
            clientId,
            type,
            category: 'condition',
            title,
            message,
            actionUrl,
            conditionKey,
          },
          {
            transaction,
          },
        )

      notifications.push(notification)
      continue
    }

    const values = {
      clientId,
      type,
      category: 'condition',
      title,
      message,
      actionUrl,
    }

    const wasResolved =
      Boolean(existing.resolvedAt)

    if (wasResolved) {
      values.readAt = null
      values.attendedAt = null
      values.resolvedAt = null
      values.resolutionType = null
    }

    await existing.update(
      values,
      {
        transaction,
      },
    )

    notifications.push(existing)
  }

  return notifications
}

export async function resolveConditionNotification({
  conditionKey,
  transaction,
}) {
  const now = new Date()

  const [, notifications] =
    await Notification.update(
      {
        readAt: now,
        resolvedAt: now,
        resolutionType: 'automatic',
      },
      {
        where: {
          category: 'condition',
          conditionKey,
          resolvedAt: null,
        },

        returning: true,
        transaction,
      },
    )

  return notifications
}
