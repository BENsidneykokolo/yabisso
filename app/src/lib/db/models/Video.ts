import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Video extends Model {
  static table = 'videos'

  @text('title') title!: string
  @text('category') category!: string
  @text('genre') genre!: string
  @text('description') description!: string
  @field('duration_seconds') durationSeconds!: number
  @text('thumbnail_url') thumbnailUrl!: string
  @text('video_url') videoUrl!: string
  @text('local_path') localPath!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}