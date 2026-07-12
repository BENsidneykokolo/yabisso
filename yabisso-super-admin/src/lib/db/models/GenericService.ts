import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class GenericService extends Model {
  static table = 'generic_services'

  @text('service_type') serviceType!: string
  @text('name') name!: string
  @text('provider_name') providerName!: string
  @text('description') description!: string
  @text('price') price!: string
  @field('rating') rating!: number
  @text('location') location!: string
  @text('status') status!: string
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
