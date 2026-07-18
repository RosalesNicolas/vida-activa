import { api } from './api'

export async function getMeasurementsByClient(
  clientId,
  params = {},
) {
  const response = await api.get(
    `/measurements/client/${clientId}`,
    { params },
  )

  return response.data
}

export async function createMeasurement(
  measurementData,
) {
  const response = await api.post(
    '/measurements',
    measurementData,
  )

  return response.data
}

export async function updateMeasurement(
  id,
  measurementData,
) {
  const response = await api.put(
    `/measurements/${id}`,
    measurementData,
  )

  return response.data
}

export async function getMyMeasurements(params = {}) {
  const response = await api.get(
    '/measurements/me',
    { params },
  )

  return response.data
}

export async function createMyMeasurement(
  measurementData,
) {
  const response = await api.post(
    '/measurements/me',
    measurementData,
  )

  return response.data
}

export async function deleteMeasurement(id) {
  const response = await api.delete(
    `/measurements/${id}`,
  )

  return response.data
}

export async function getMyMeasurementEvolution() {
  const response = await api.get(
    '/measurements/me/evolution',
  )

  return response.data
}

export async function getMeasurementEvolutionByClient(
  clientId,
) {
  const response = await api.get(
    `/measurements/client/${clientId}/evolution`,
  )

  return response.data
}

export async function getMeasurementById(id) {
  const response = await api.get(
    `/measurements/${id}`,
  )

  return response.data
}
