import { Model } from '@nozbe/watermelondb'
import { date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class AssistantMessage extends Model {
  static table = 'assistant_messages'

  @text('role') role!: string
  @text('content') content!: string

  @readonly @date('created_at') createdAt!: number
}
