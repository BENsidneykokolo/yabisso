import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import { modelClasses } from './models'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'yabisso',
  onSetUpError: (error) => {
    throw error
  },
})

export const database = new Database({
  adapter,
  modelClasses,
})
