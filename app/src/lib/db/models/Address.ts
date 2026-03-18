import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Address extends Model {
  static table = 'addresses'

  @text('name') name
  @text('category') category
  @text('city') city
  @text('city_code') cityCode
  @text('full_address') full_address
  @field('latitude') latitude
  @field('longitude') longitude
  @text('unique_id') unique_id
  @text('qr_payload') qr_payload

  @readonly @date('created_at') createdAt
  @readonly @date('updated_at') updatedAt
}
