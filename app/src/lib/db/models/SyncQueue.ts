import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export class SyncQueue extends Model {
  static table = 'sync_queue'

  @field('action') action!: string
  @field('payload_json') payloadJson!: string
  @field('status') status!: string
  @field('retry_count') retryCount!: number
  @field('last_error') lastError!: string | null
  @field('next_retry_at') nextRetryAt!: number | null
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}
