import {
  col,
  fn,
  Op,
} from 'sequelize'
import { Client } from '../clients/client.model.js'
import { User } from '../users/user.model.js'
import { Measurement } from '../measurements/measurement.model.js'
import { Routine } from '../routines/routine.model.js'
import {
  buildConditionKey,
  resolveConditionNotification,
  syncConditionNotificationForAdmins,
} from './notification.service.js'

const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000

const ROUTINE_WARNING_DAYS = 7
const INACTIVITY_DAYS = 30

let currentSyncPromise = null

function parseDateOnly(value) {
  if (!value) {
    return null
  }

  const normalizedValue =
    String(value).slice(0, 10)

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalizedValue,
    )
  ) {
    return null
  }

  const [
    year,
    month,
    day,
  ] = normalizedValue
    .split('-')
    .map(Number)

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  )

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

function getTodayDateOnly() {
  const now = new Date()

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  )
}

function getCalendarDayDifference(
  laterDate,
  earlierDate,
) {
  return Math.floor(
    (
      laterDate.getTime() -
      earlierDate.getTime()
    ) / DAY_IN_MILLISECONDS,
  )
}

function formatDate(value) {
  const date = parseDateOnly(value)

  if (!date) {
    return 'fecha no indicada'
  }

  const day = String(
    date.getUTCDate(),
  ).padStart(2, '0')

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, '0')

  const year =
    date.getUTCFullYear()

  return `${day}/${month}/${year}`
}

async function syncRoutineConditions({
  client,
  activeRoutine,
  today,
}) {
  const clientId = client.id

  const clientName =
    client.user?.name || 'El cliente'

  const noRoutineKey =
    buildConditionKey(
      'client_without_active_routine',
      clientId,
    )

  const routineDeadlineKey =
    buildConditionKey(
      'routine_deadline',
      clientId,
    )

  if (!activeRoutine) {
    await syncConditionNotificationForAdmins({
      clientId,
      type:
        'client_without_active_routine',
      title: 'Cliente sin rutina activa',
      message:
        `${clientName} no tiene una rutina activa asignada.`,
      actionUrl:
        `/admin/clients/${clientId}`,
      conditionKey: noRoutineKey,
    })

    await resolveConditionNotification({
      conditionKey:
        routineDeadlineKey,
    })

    return
  }

  await resolveConditionNotification({
    conditionKey: noRoutineKey,
  })

  const endDate = parseDateOnly(
    activeRoutine.endDate,
  )

  if (!endDate) {
    await resolveConditionNotification({
      conditionKey:
        routineDeadlineKey,
    })

    return
  }

  const daysUntilExpiration =
    getCalendarDayDifference(
      endDate,
      today,
    )

  if (daysUntilExpiration < 0) {
    await syncConditionNotificationForAdmins({
      clientId,
      type: 'routine_expired',
      title: 'Rutina vencida',
      message:
        `La rutina activa de ${clientName} venció el ${formatDate(activeRoutine.endDate)}.`,
      actionUrl:
        `/admin/clients/${clientId}`,
      conditionKey:
        routineDeadlineKey,
    })

    return
  }

  if (
    daysUntilExpiration <=
    ROUTINE_WARNING_DAYS
  ) {
    const timeMessage =
      daysUntilExpiration === 0
        ? 'vence hoy'
        : daysUntilExpiration === 1
          ? 'vence mañana'
          : `vence dentro de ${daysUntilExpiration} días`

    await syncConditionNotificationForAdmins({
      clientId,
      type: 'routine_ending_soon',
      title:
        'Rutina próxima a vencer',
      message:
        `La rutina activa de ${clientName} ${timeMessage}, el ${formatDate(activeRoutine.endDate)}.`,
      actionUrl:
        `/admin/clients/${clientId}`,
      conditionKey:
        routineDeadlineKey,
    })

    return
  }

  await resolveConditionNotification({
    conditionKey:
      routineDeadlineKey,
  })
}

async function syncMeasurementConditions({
  client,
  lastMeasurementDate,
  today,
}) {
  const clientId = client.id

  const clientName =
    client.user?.name || 'El cliente'

  const neverMeasuredKey =
    buildConditionKey(
      'client_never_measured',
      clientId,
    )

  const inactivityKey =
    buildConditionKey(
      'client_without_recent_measurement',
      clientId,
    )

  if (!lastMeasurementDate) {
    await syncConditionNotificationForAdmins({
      clientId,
      type: 'client_never_measured',
      title:
        'Cliente sin mediciones',
      message:
        `${clientName} todavía no tiene mediciones registradas.`,
      actionUrl:
        `/admin/clients/${clientId}`,
      conditionKey:
        neverMeasuredKey,
    })

    await resolveConditionNotification({
      conditionKey: inactivityKey,
    })

    return
  }

  await resolveConditionNotification({
    conditionKey: neverMeasuredKey,
  })

  const measurementDate =
    parseDateOnly(lastMeasurementDate)

  if (!measurementDate) {
    await resolveConditionNotification({
      conditionKey: inactivityKey,
    })

    return
  }

  const daysWithoutMeasurement =
    getCalendarDayDifference(
      today,
      measurementDate,
    )

  if (
    daysWithoutMeasurement >
    INACTIVITY_DAYS
  ) {
    await syncConditionNotificationForAdmins({
      clientId,
      type:
        'client_without_recent_measurement',
      title:
        'Cliente sin actividad reciente',
      message:
        `${clientName} no registra mediciones desde el ${formatDate(lastMeasurementDate)}.`,
      actionUrl:
        `/admin/clients/${clientId}`,
      conditionKey: inactivityKey,
    })

    return
  }

  await resolveConditionNotification({
    conditionKey: inactivityKey,
  })
}

async function performNotificationConditionSync() {
  const clients = await Client.findAll({
    attributes: ['id'],

    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name'],
        where: {
          active: true,
        },
        required: true,
      },
    ],

    order: [
      ['id', 'ASC'],
    ],
  })

  if (clients.length === 0) {
    return {
      processedClients: 0,
    }
  }

  const clientIds =
    clients.map((client) => client.id)

  const [
    activeRoutines,
    latestMeasurements,
  ] = await Promise.all([
    Routine.findAll({
      where: {
        clientId: {
          [Op.in]: clientIds,
        },
        active: true,
      },

      order: [
        ['clientId', 'ASC'],
        ['version', 'DESC'],
        ['id', 'DESC'],
      ],
    }),

    Measurement.findAll({
      where: {
        clientId: {
          [Op.in]: clientIds,
        },
      },

      attributes: [
        'clientId',
        [
          fn('MAX', col('date')),
          'lastMeasurementDate',
        ],
      ],

      group: ['clientId'],
      raw: true,
    }),
  ])

  const activeRoutineByClient =
    new Map()

  for (
    const routine of activeRoutines
  ) {
    if (
      !activeRoutineByClient.has(
        routine.clientId,
      )
    ) {
      activeRoutineByClient.set(
        routine.clientId,
        routine,
      )
    }
  }

  const lastMeasurementByClient =
    new Map(
      latestMeasurements.map(
        (measurement) => [
          Number(measurement.clientId),
          measurement.lastMeasurementDate,
        ],
      ),
    )

  const today = getTodayDateOnly()

  for (const client of clients) {
    await syncRoutineConditions({
      client,
      activeRoutine:
        activeRoutineByClient.get(
          client.id,
        ) || null,
      today,
    })

    await syncMeasurementConditions({
      client,
      lastMeasurementDate:
        lastMeasurementByClient.get(
          client.id,
        ) || null,
      today,
    })
  }

  return {
    processedClients:
      clients.length,
  }
}

export async function syncNotificationConditions() {
  if (currentSyncPromise) {
    return currentSyncPromise
  }

  currentSyncPromise =
    performNotificationConditionSync()

  try {
    return await currentSyncPromise
  } finally {
    currentSyncPromise = null
  }
}
