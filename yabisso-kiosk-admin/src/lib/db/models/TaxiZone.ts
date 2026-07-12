import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class TaxiZone extends Model {
  static table = 'taxi_zones'

  @text('name') name!: string
  @text('city') city!: string
  @text('area_coordinates_json') areaCoordinatesJson!: string
  @text('price_base') priceBase!: string
  @text('price_per_km') pricePerKm!: string
  @field('drivers_count') driversCount!: number
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}