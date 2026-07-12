import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export class SignupVerification extends Model {
  static table = 'signup_verifications'

  @field('phone') phone!: string
  @field('verification_token') verificationToken!: string
  @field('channel') channel!: string
  @field('kiosk_id') kioskId!: string | null
  @field('created_at') createdAt!: number
}
