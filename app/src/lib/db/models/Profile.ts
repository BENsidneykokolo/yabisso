import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export class Profile extends Model {
  static table = 'profiles'

  @field('phone') phone!: string
  @field('device_id') deviceId!: string
  @field('public_key') publicKey!: string
  @field('status') status!: string
  @field('kiosk_id') kioskId!: string | null
  @field('verification_token') verificationToken!: string | null
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}
