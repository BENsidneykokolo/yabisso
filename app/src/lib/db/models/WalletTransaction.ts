import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class WalletTransaction extends Model {
  static table = 'wallet_transactions'

  @text('title') title!: string
  @text('meta') meta!: string
  @text('amount') amount!: string
  @field('is_positive') isPositive!: boolean
  @text('wallet_mode') walletMode!: string // 'fcfa' or 'points'

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
