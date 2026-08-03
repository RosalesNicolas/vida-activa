import fs from 'node:fs'
import path from 'node:path'
import { env } from '../../config/env.js'

export async function downloadDatabaseBackup(req, res) {
  try {
    const databasePath = path.resolve(env.dbStorage)

    if (!fs.existsSync(databasePath)) {
      return res.status(404).json({
        ok: false,
        message: 'No se encontró la base de datos',
      })
    }

    const date = new Date()
      .toISOString()
      .replaceAll(':', '-')
      .replaceAll('.', '-')

    const fileName = `vida-activa-backup-${date}.sqlite`

    return res.download(databasePath, fileName)
  } catch (error) {
    console.error('Error al descargar el backup:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo descargar el backup',
    })
  }
}
