import { api } from './api'

export async function getAdminDashboard() {
  const response = await api.get(
    '/dashboard/admin',
  )

  return response.data
}

export async function getClientDashboard() {
  const response = await api.get(
    '/dashboard/client',
  )

  return response.data
}
