import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class UserInterest extends Model {
  static table = 'user_interests'

  @field('service') service!: string;
  @field('category') category!: string;
  @field('weight') weight!: number;

  @readonly @date('updated_at') updatedAt!: Date;
}
