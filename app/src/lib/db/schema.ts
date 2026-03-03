import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'profiles',
      columns: [
        { name: 'phone', type: 'string', isIndexed: true },
        { name: 'device_id', type: 'string' },
        { name: 'public_key', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'kiosk_id', type: 'string', isOptional: true },
        { name: 'verification_token', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'action', type: 'string', isIndexed: true },
        { name: 'payload_json', type: 'string' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'retry_count', type: 'number' },
        { name: 'last_error', type: 'string', isOptional: true },
        { name: 'next_retry_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'signup_nonces',
      columns: [
        { name: 'phone', type: 'string', isIndexed: true },
        { name: 'signup_nonce', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'signup_verifications',
      columns: [
        { name: 'phone', type: 'string', isIndexed: true },
        { name: 'verification_token', type: 'string', isIndexed: true },
        { name: 'channel', type: 'string' },
        { name: 'kiosk_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
})
