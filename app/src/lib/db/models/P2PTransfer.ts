import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class P2PTransfer extends Model {
  static table = 'p2p_transfers'

  @field('hash') hash!: string;
  @field('peer_id') peerId!: string;
  @field('direction') direction!: string; // 'upload' | 'download'
  @field('rail') rail!: string; // 'ble_mesh' | 'wifi_direct' | 'internet'
  @field('file_size') fileSize!: number;
  @field('bytes_transferred') bytesTransferred!: number;
  @field('status') status!: string; // 'pending' | 'in_progress' | 'complete' | 'failed'
  @field('error') error!: string | null;
  @field('retry_count') retryCount!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
