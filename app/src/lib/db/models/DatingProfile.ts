import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class DatingProfile extends Model {
  static table = 'dating_profiles'

  @text('name') name!: string
  @field('age') age!: number
  @text('gender') gender!: string
  @text('city') city!: string
  @text('bio') bio!: string
  @text('photos_json') photosJson!: string
  @text('interests_json') interestsJson!: string
  @text('preferences_json') preferencesJson!: string
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}