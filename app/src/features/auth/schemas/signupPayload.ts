import type { ProfileStatus, SyncAction } from '../models/types'

export type SignupChannel = 'qr' | 'sms' | 'p2p'

export type SignupPayload = {
  version: 1
  action: SyncAction
  profile: {
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
  signup: {
    signupNonce: string
    timestamp: number
    channel: SignupChannel
    signature: string
  }
  meta: {
    deviceId: string
    appVersion: string
    retry: number
  }
}
