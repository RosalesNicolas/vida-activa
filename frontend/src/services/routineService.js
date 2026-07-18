import { api } from './api'

export async function getRoutinesByClient(
  clientId,
  params = {},
) {
  const response = await api.get(
    `/routines/client/${clientId}`,
    {
      params,
    },
  )

  return response.data
}

export async function deactivateRoutine(routineId) {
  const response = await api.patch(
    `/routines/${routineId}/deactivate`,
  )

  return response.data
}

export async function activateRoutine(routineId) {
  const response = await api.patch(
    `/routines/${routineId}/activate`,
  )

  return response.data
}

export async function createRoutine(routineData) {
  const response = await api.post('/routines', routineData)

  return response.data
}

export async function updateRoutine(routineId, routineData) {
  const response = await api.put(
    `/routines/${routineId}`,
    routineData,
  )

  return response.data
}

export async function getMyRoutines(
  params = {},
) {
  const response = await api.get(
    '/routines/me',
    {
      params,
    },
  )

  return response.data
}

