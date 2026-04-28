import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Medicament extends Model {
  static table = 'medicaments'

  @text('name') name!: string
  @text('generic_name') genericName!: string
  @text('category') category!: string
  @text('manufacturer') manufacturer!: string
  @text('dosage') dosage!: string
  @text('price') price!: string
  @field('requires_prescription') requiresPrescription!: boolean
  @field('in_stock') inStock!: boolean
  @text('pharmacy_id') pharmacyId!: string
  @text('description') description!: string
  @field('is_validated') isValidated!: boolean
  @text('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}