import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Reservation extends Model {
  static table = 'reservations'

  @text('service_type') serviceType!: string // restaurant, hotel, flight
  @text('service_id') serviceId!: string
  @text('service_name') serviceName!: string
  @field('date') date!: number
  @text('time') time!: string
  @text('status') status!: string // pending, confirmed, cancelled
  @text('details_json') detailsJson!: string
  @text('total_price') totalPrice!: string
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}