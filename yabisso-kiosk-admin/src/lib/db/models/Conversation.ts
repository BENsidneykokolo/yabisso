import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Conversation extends Model {
  static table = 'conversations'

  @text('participant_id') participantId!: string
  @text('participant_name') participantName!: string
  @text('last_message') lastMessage!: string
  @field('last_message_at') lastMessageAt!: number
  @field('unread_count') unreadCount!: number
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}