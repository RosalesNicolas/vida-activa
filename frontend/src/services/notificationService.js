import { api } from './api'

export async function getNotifications({
  page = 1,
  limit = 10,
  status = 'pending',
} = {}) {
  const response = await api.get('/notifications', {
    params: { page, limit, status },
  })

  return response.data
}

export async function getNotificationSummary() {
  const response = await api.get('/notifications/summary')
  return response.data
}

export async function markNotificationAsRead(notificationId) {
  const response = await api.patch(
    `/notifications/${notificationId}/read`,
  )

  return response.data
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch('/notifications/read-all')
  return response.data
}

export async function attendNotification(notificationId) {
  const response = await api.patch(
    `/notifications/${notificationId}/attend`,
  )

  return response.data
}

export async function reopenNotification(notificationId) {
  const response = await api.patch(
    `/notifications/${notificationId}/reopen`,
  )

  return response.data
}
