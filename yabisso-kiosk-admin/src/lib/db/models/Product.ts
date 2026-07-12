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
  @text('description') description!: string
  @text('min_price') minPrice!: string
  @field('stock') stock!: number
  @text('photos_json') photosJson!: string
  @text('condition') condition!: string
  @text('colors_json') colorsJson!: string
  @text('sizes_json') sizesJson!: string
  @text('tags_json') tagsJson!: string
  @text('seller_id') sellerId!: string
  @text('seller_name') sellerName!: string
  @field('is_validated') isValidated!: boolean
  @text('validated_by') validatedBy!: string
  @text('product_sync_status') productSyncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
