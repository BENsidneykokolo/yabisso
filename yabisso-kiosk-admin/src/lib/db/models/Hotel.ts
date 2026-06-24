import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Hotel extends Model {
  static table = 'hotels'

  @text('name') name!: string
  @text('category') category!: string
  @text('city') city!: string
  @text('address') address!: string
  @field('latitude') latitude!: number
  @field('longitude') longitude!: number
  @field('stars') stars!: number
  @field('rating') rating!: number
  @field('price_min') priceMin!: number
  @field('price_max') priceMax!: number
  @text('amenities_json') amenitiesJson!: string
  @text('photos_json') photosJson!: string
  @text('description') description!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}