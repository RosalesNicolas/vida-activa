import { api } from './api'

export async function getClients(params = {}) {
  const response = await api.get('/clients', {
    params,
  })

  return response.data
}

export async function getClientById(id) {
  const response = await api.get(`/clients/${id}`)

  return response.data
}

export async function updateClient(id, clientData) {
  const response = await api.put(`/clients/${id}`, clientData)

  return response.data
}

export async function createClient(clientData) {
  const response = await api.post('/clients', clientData)

  return response.data
}

export async function activateClient(id) {
  const response = await api.patch(`/clients/${id}/activate`)
  return response.data
}

export async function deactivateClient(id) {
  const response = await api.patch(`/clients/${id}/deactivate`)
  return response.data
}

export async function getMyClientProfile() {
  const response = await api.get('/clients/me')

  return response.data
}


export async function updateMyClientProfile(profileData) {
  const response = await api.put(
    '/clients/me',
    profileData,
  )

  return response.data
}

