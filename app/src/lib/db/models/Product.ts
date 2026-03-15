import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Product extends Model {
  static table = 'products'

  @text('name') name!: string
  @text('brand') brand!: string
  @text('price') price!: string
  @text('category') category!: string
  @field('is_new') isNew!: boolean
  @text('image_url') imageUrl!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
