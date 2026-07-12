import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class BettingBet extends Model {
  static table = 'betting_bets'

  @text('user_id') userId!: string
  @text('match_id') matchId!: string
  @text('selection') selection!: string
  @field('odds') odds!: number
  @field('stake') stake!: number
  @text('status') status!: string
  @field('payout') payout!: number
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
