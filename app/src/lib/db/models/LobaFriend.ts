import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export class LobaFriend extends Model {
  static table = 'loba_friends'

  @field('friend_id') friendId!: string
  @field('name') name!: string
  @field('username') username!: string
  @field('phone') phone!: string
  @field('avatar') avatar!: string | null
  @field('status') status!: string // online, mesh, direct, offline
  @field('last_seen') lastSeen!: number

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
