import { api } from './api'

export async function getProgressByClient(
  clientId,
  params = {},
) {
  const response = await api.get(
    `/progress/client/${clientId}`,
    {
      params,
    },
  )

  return response.data
}

export async function createProgress(
  progressData,
) {
  const response = await api.post(
    '/progress',
    progressData,
  )

  return response.data
}

export async function updateProgressNote(
  id,
  progressData,
) {
  const response = await api.put(
    `/progress/${id}`,
    progressData,
  )

  return response.data
}

export async function getMyProgress(
  params = {},
) {
  const response = await api.get(
    '/progress/me',
    {
      params,
    },
  )

  return response.data
}

export async function updateMyProgressComment(
  progressId,
  clientComment,
) {
  const response = await api.patch(
    `/progress/${progressId}/client-comment`,
    {
      clientComment,
    },
  )

  return response.data
}

export async function setProgressCommentEditing(
  progressId,
  enabled,
) {
  const response = await api.patch(
    `/progress/${progressId}/client-comment-editing`,
    {
      enabled,
    },
  )

  return response.data
}
