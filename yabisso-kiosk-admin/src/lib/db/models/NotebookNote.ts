import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class NotebookNote extends Model {
  static table = 'notebook_notes'

  @text('user_id') userId!: string
  @text('title') title!: string
  @text('content') content!: string
  @text('category') category!: string
  @text('color') color!: string
  @field('is_pinned') isPinned!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
