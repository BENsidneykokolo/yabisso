import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class SwapItem extends Model {
  static table = 'swap_items'

  @text('user_id') userId!: string
  @text('title') title!: string
  @text('description') description!: string
  @text('category') category!: string
  @text('condition') condition!: string
  @text('image_url') imageUrl!: string
  @text('value_est') valueEst!: string
  @text('status') status!: string
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
