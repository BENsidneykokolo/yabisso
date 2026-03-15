import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class LobaPost extends Model {
  static table = 'loba_posts'

  @text('username') username!: string
  @text('avatar') avatar!: string
  @text('content') content!: string
  @text('image_url') imageUrl!: string
  @text('video_url') videoUrl!: string
  @field('likes') likes!: number
  @field('comments') comments!: number
  @field('is_liked') isLiked!: boolean

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
