import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export class SignupNonce extends Model {
  static table = 'signup_nonces'

  @field('phone') phone!: string
  @field('signup_nonce') signupNonce!: string
  @field('created_at') createdAt!: number
}
