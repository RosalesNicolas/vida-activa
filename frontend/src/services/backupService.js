import { api } from './api'

export async function downloadDatabaseBackup() {
  const response = await api.get('/backups/database', {
    responseType: 'blob',
  })

  const disposition = response.headers['content-disposition']
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/)
  const filename =
    filenameMatch?.[1] ?? `vida-activa-backup-${Date.now()}.sqlite`

  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}
