import { api } from './api'

export async function loginRequest(credentials) {
  const response = await api.post('/auth/login', credentials)

  return response.data
}

export async function getCurrentUser(token) {
  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function changePasswordRequest(passwordData) {
  const response = await api.put(
    '/auth/change-password',
    passwordData,
  )

  return response.data
}

export async function forgotPasswordRequest(email) {
  const response = await api.post(
    '/auth/forgot-password',
    { email },
  )

  return response.data
}

export async function resetPasswordRequest(passwordData) {
  const response = await api.post(
    '/auth/reset-password',
    passwordData,
  )

  return response.data
}
