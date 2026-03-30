import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class LobaPost extends Model {
  static table = 'loba_posts'

  @text('username') username!: string
  @text('avatar') avatar!: string
  @text('content') content!: string
  @text('image_url') imageUrl!: string
  @field('video_url') videoUrl!: string | null;
  @field('hash') hash!: string;
  @field('local_media_path') localMediaPath!: string | null;
  @field('category') category!: string;
  @field('size') size!: number;
  @field('likes') likes!: number
  @field('comments') comments!: number
  @field('is_liked') isLiked!: boolean
  @field('filter_color') filterColor!: string | null;
  @field('is_propagating') isPropagating!: boolean
  @field('downloaded_at') downloadedAt!: number | null;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
