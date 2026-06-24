import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class DeliveryOrder extends Model {
  static table = 'delivery_orders'

  @text('user_id') userId!: string
  @text('service_name') serviceName!: string
  @text('items_json') itemsJson!: string
  @text('total_price') totalPrice!: string
  @text('status') status!: string
  @text('address') address!: string
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
