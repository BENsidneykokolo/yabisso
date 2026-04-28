import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Property extends Model {
  static table = 'properties'

  @text('title') title!: string
  @text('type') type!: string // vente, location
  @text('category') category!: string // appartement, maison, villa
  @text('city') city!: string
  @text('address') address!: string
  @field('latitude') latitude!: number
  @field('longitude') longitude!: number
  @text('price') price!: string
  @field('surface_m2') surfaceM2!: number
  @field('rooms') rooms!: number
  @field('bedrooms') bedrooms!: number
  @field('bathrooms') bathrooms!: number
  @text('photos_json') photosJson!: string
  @text('description') description!: string
  @text('amenities_json') amenitiesJson!: string
  @text('seller_id') sellerId!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}