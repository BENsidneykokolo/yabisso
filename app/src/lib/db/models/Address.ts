import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Address extends Model {
  static table = 'addresses'

  @text('name') name
  @text('full_address') fullAddress
  @field('latitude') latitude
  @field('longitude') longitude
  @text('unique_id') uniqueId
  @text('qr_payload') qrPayload
  @text('category') category

  @readonly @date('created_at') createdAt
  @readonly @date('updated_at') updatedAt
}
