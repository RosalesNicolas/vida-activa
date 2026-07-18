import { col, fn } from 'sequelize'
import { User } from '../users/user.model.js'
import { Client } from '../clients/client.model.js'
import { Routine } from '../routines/routine.model.js'
import { Measurement } from '../measurements/measurement.model.js'
import { Progress } from '../progress/progress.model.js'

const RECENT_MEASUREMENT_DAYS = 30

function getCutoffDate(days) {
  const date = new Date()

  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)

  return date.toISOString().slice(0, 10)
}

function buildClientSummary(client) {
  return {
    id: client.id,
    name: client.user?.name || 'Cliente',
    email: client.user?.email || null,
  }
}

export async function getAdminDashboard(req, res) {
  try {
    const measurementCutoffDate = getCutoffDate(
      RECENT_MEASUREMENT_DAYS,
    )

    const [
      clients,
      activeRoutineRows,
      latestMeasurementRows,
      progressRows,
    ] = await Promise.all([
      Client.findAll({
        attributes: [
          'id',
          'createdAt',
        ],

        include: [
          {
            model: User,
            as: 'user',
            attributes: [
              'name',
              'email',
              'active',
            ],
            required: true,
          },
        ],

        order: [
          ['createdAt', 'DESC'],
        ],
      }),

      Routine.findAll({
        where: {
          active: true,
        },

        attributes: [
          'clientId',
        ],

        raw: true,
      }),

      Measurement.findAll({
        attributes: [
          'clientId',
          [
            fn('MAX', col('date')),
            'lastMeasurementDate',
          ],
        ],

        group: [
          'clientId',
        ],

        raw: true,
      }),

      Progress.findAll({
        attributes: [
          'id',
          'clientId',
          'date',
          'title',
          'status',
          'clientComment',
          'updatedAt',
        ],

        order: [
          ['updatedAt', 'DESC'],
        ],

        raw: true,
      }),
    ])

    const activeClients = clients.filter(
      (client) => client.user?.active,
    )

    const inactiveClients = clients.filter(
      (client) => !client.user?.active,
    )

    const clientById = new Map(
      clients.map((client) => [
        Number(client.id),
        client,
      ]),
    )

    const activeRoutineClientIds = new Set(
      activeRoutineRows.map((routine) =>
        Number(routine.clientId),
      ),
    )

    const lastMeasurementByClient = new Map(
      latestMeasurementRows.map((measurement) => [
        Number(measurement.clientId),
        measurement.lastMeasurementDate,
      ]),
    )

    const clientsWithoutRoutine =
      activeClients.filter(
        (client) =>
          !activeRoutineClientIds.has(
            Number(client.id),
          ),
      )

    const clientsWithoutRecentMeasurement =
      activeClients.filter((client) => {
        const lastMeasurementDate =
          lastMeasurementByClient.get(
            Number(client.id),
          )

        return (
          !lastMeasurementDate ||
          lastMeasurementDate <
            measurementCutoffDate
        )
      })

    const progressInProcess =
      progressRows.filter(
        (progress) =>
          progress.status === 'en_proceso',
      )

    const progressWithClientResponse =
      progressRows.filter(
        (progress) =>
          typeof progress.clientComment ===
            'string' &&
          progress.clientComment.trim() !== '',
      )

    const buildProgressSummary = (
      progress,
    ) => {
      const client = clientById.get(
        Number(progress.clientId),
      )

      return {
        id: progress.id,
        clientId: progress.clientId,
        clientName:
          client?.user?.name || 'Cliente',
        title: progress.title,
        date: progress.date,
        status: progress.status,
        clientComment:
          progress.clientComment || null,
        updatedAt: progress.updatedAt,
      }
    }

    return res.json({
      ok: true,

      metrics: {
        totalClients: clients.length,
        activeClients: activeClients.length,
        inactiveClients:
          inactiveClients.length,

        activeRoutines:
          activeClients.filter((client) =>
            activeRoutineClientIds.has(
              Number(client.id),
            ),
          ).length,

        clientsWithoutRoutine:
          clientsWithoutRoutine.length,

        clientsWithoutRecentMeasurement:
          clientsWithoutRecentMeasurement.length,

        progressInProcess:
          progressInProcess.length,

        clientResponses:
          progressWithClientResponse.length,
      },

      attention: {
        clientsWithoutRoutine:
          clientsWithoutRoutine
            .slice(0, 10)
            .map(buildClientSummary),

        clientsWithoutRecentMeasurement:
          clientsWithoutRecentMeasurement
            .slice(0, 10)
            .map((client) => ({
              ...buildClientSummary(client),

              lastMeasurementDate:
                lastMeasurementByClient.get(
                  Number(client.id),
                ) || null,
            })),

        progressInProcess:
          progressInProcess
            .slice(0, 10)
            .map(buildProgressSummary),
      },

      recent: {
        clientResponses:
          progressWithClientResponse
            .slice(0, 5)
            .map(buildProgressSummary),

        latestClients:
          clients
            .slice(0, 5)
            .map(buildClientSummary),
      },

      settings: {
        recentMeasurementDays:
          RECENT_MEASUREMENT_DAYS,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al obtener el dashboard administrativo',
    })
  }
}

export async function getClientDashboard(req, res) {
  try {
    const client = await Client.findOne({
      where: {
        userId: req.user.id,
      },

      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'email',
            'active',
          ],
        },
      ],
    })

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: 'Perfil de cliente no encontrado',
      })
    }

    const [
      activeRoutine,
      measurements,
      latestProgress,
    ] = await Promise.all([
      Routine.findOne({
        where: {
          clientId: client.id,
          active: true,
        },

        order: [
          ['version', 'DESC'],
          ['id', 'DESC'],
        ],
      }),

      Measurement.findAll({
        where: {
          clientId: client.id,
        },

        order: [
          ['date', 'DESC'],
          ['id', 'DESC'],
        ],

        limit: 2,
      }),

      Progress.findOne({
        where: {
          clientId: client.id,
          visibleToClient: true,
        },

        order: [
          ['date', 'DESC'],
          ['id', 'DESC'],
        ],
      }),
    ])

    const latestMeasurement =
      measurements[0] || null

    const previousMeasurement =
      measurements[1] || null

    const calculateChange = (
      currentValue,
      previousValue,
    ) => {
      const current = Number(currentValue)
      const previous = Number(previousValue)

      if (
        !Number.isFinite(current) ||
        !Number.isFinite(previous)
      ) {
        return null
      }

      return Number(
        (current - previous).toFixed(1),
      )
    }

    const weightChange =
      latestMeasurement &&
      previousMeasurement
        ? calculateChange(
            latestMeasurement.weight,
            previousMeasurement.weight,
          )
        : null

    const bodyFatChange =
      latestMeasurement &&
      previousMeasurement
        ? calculateChange(
            latestMeasurement.bodyFatPercentage,
            previousMeasurement.bodyFatPercentage,
          )
        : null

    const requiredProfileComplete = Boolean(
      client.user?.name &&
      client.user?.email &&
      typeof client.diseases === 'string' &&
      client.diseases.trim(),
    )

    return res.json({
      ok: true,

      client: {
        id: client.id,
        name:
          client.user?.name || 'Cliente',
        email:
          client.user?.email || null,
        requiredProfileComplete,
        startDate: client.startDate,
      },

      routine: activeRoutine
        ? {
            id: activeRoutine.id,
            title: activeRoutine.title,
            objective:
              activeRoutine.objective,
            description:
              activeRoutine.description,
            startDate:
              activeRoutine.startDate,
            endDate:
              activeRoutine.endDate,
            version:
              activeRoutine.version,
          }
        : null,

      measurements: {
        latest: latestMeasurement
          ? {
              id: latestMeasurement.id,
              date: latestMeasurement.date,
              weight:
                latestMeasurement.weight,
              waist:
                latestMeasurement.waist,
              hip:
                latestMeasurement.hip,
              bodyFatPercentage:
                latestMeasurement.bodyFatPercentage,
            }
          : null,

        previous: previousMeasurement
          ? {
              id: previousMeasurement.id,
              date:
                previousMeasurement.date,
              weight:
                previousMeasurement.weight,
              bodyFatPercentage:
                previousMeasurement.bodyFatPercentage,
            }
          : null,

        weightChange,
        bodyFatChange,
      },

      progress: latestProgress
        ? {
            id: latestProgress.id,
            date: latestProgress.date,
            title: latestProgress.title,
            comment:
              latestProgress.comment,
            status:
              latestProgress.status,
            nextAction:
              latestProgress.nextAction,
            clientComment:
              latestProgress.clientComment,
          }
        : null,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      message:
        'Error al obtener el dashboard del cliente',
    })
  }
}
