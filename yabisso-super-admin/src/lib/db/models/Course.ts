import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Course extends Model {
  static table = 'courses'

  @text('title') title!: string
  @text('category') category!: string
  @text('instructor') instructor!: string
  @text('description') description!: string
  @field('duration_hours') durationHours!: number
  @text('price') price!: string
  @text('level') level!: string
  @text('thumbnail_url') thumbnailUrl!: string
  @text('video_url') videoUrl!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}