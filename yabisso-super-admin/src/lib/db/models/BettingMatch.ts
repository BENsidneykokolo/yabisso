import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class BettingMatch extends Model {
  static table = 'betting_matches'

  @text('home_team') homeTeam!: string
  @text('away_team') awayTeam!: string
  @text('home_logo') homeLogo!: string
  @text('away_logo') awayLogo!: string
  @text('score') score!: string
  @text('time') time!: string
  @text('competition') competition!: string
  @text('odds_json') oddsJson!: string
  @field('start_time') startTime!: number
  @text('status') status!: string
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
