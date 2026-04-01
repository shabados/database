import { createArchiveDatabaseClient, archiveSchema } from '../../../../archive/src/client'
import type { ArchiveDatabaseClient } from '../../../../archive/src/client'

export const createArchiveSourceClient = (path = process.env.ARCHIVE_DATABASE_PATH) => {
  if (!path) {
    return createArchiveDatabaseClient()
  }

  return createArchiveDatabaseClient({ path })
}

export { archiveSchema }
export type { ArchiveDatabaseClient }

