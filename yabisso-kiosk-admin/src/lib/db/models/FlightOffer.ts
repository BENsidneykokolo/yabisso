import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class FlightOffer extends Model {
  static table = 'flight_offers'

  @text('airline') airline!: string
  @text('from_city') fromCity!: string
  @text('to_city') toCity!: string
  @field('departure_time') departureTime!: number
  @text('price') price!: string
  @text('class') flightClass!: string
  @text('status') status!: string
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
