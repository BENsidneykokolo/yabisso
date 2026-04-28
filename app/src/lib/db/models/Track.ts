import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Track extends Model {
  static table = 'tracks'

  @text('title') title!: string
  @text('artist') artist!: string
  @text('album') album!: string
  @text('genre') genre!: string
  @field('duration_seconds') durationSeconds!: number
  @text('file_path') filePath!: string
  @text('cover_url') coverUrl!: string
  @text('local_path') localPath!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}