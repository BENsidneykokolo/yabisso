export type ProfileStatus = 'pending' | 'validated_by_kiosk' | 'active'

export type Profile = {
  id: string
  phone: string
  deviceId: string
  publicKey: string
  status: ProfileStatus
  kioskId?: string | null
  verificationToken?: string | null
  createdAt: number
  updatedAt: number
}

export type SyncAction = 'create_profile' | 'verify_profile' | 'update_profile'

export type SyncQueueItem = {
  id: string
  action: SyncAction
  payloadJson: string
  status: 'pending' | 'synced' | 'failed'
  retryCount: number
  lastError?: string | null
  nextRetryAt?: number | null
  createdAt: number
  updatedAt: number
}

export type SignupNonce = {
  id: string
  phone: string
  signupNonce: string
  createdAt: number
}

export type SignupVerification = {
  id: string
  phone: string
  verificationToken: string
  channel: 'qr' | 'sms' | 'p2p'
  kioskId?: string | null
  createdAt: number
}
