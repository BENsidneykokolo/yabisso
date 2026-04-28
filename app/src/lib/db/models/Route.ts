import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Route extends Model {
  static table = 'routes'

  @text('name') name!: string
  @text('type') type!: string // bus, train, metro
  @text('city') city!: string
  @text('stops_json') stopsJson!: string
  @text('schedule_json') scheduleJson!: string
  @text('price') price!: string
  @text('operator') operator!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}