import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Restaurant extends Model {
  static table = 'restaurants'

  @text('name') name!: string
  @text('category') category!: string
  @text('cuisine') cuisine!: string
  @text('address') address!: string
  @text('city') city!: string
  @field('latitude') latitude!: number
  @field('longitude') longitude!: number
  @field('rating') rating!: number
  @text('price_range') priceRange!: string
  @field('delivery') delivery!: boolean
  @text('opening_hours') openingHours!: string
  @text('photos_json') photosJson!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}