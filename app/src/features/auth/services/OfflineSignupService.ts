import type { Profile, SyncQueueItem } from '../models/types'
import type { SignupChannel, SignupPayload } from '../schemas/signupPayload'

export type OfflineSignupInput = {
  profileId: string
  phone: string
  deviceId: string
  publicKey: string
  channel: SignupChannel
  appVersion: string
  kioskId?: string | null
}

export type OfflineSignupDeps = {
  now: () => number
  generateNonce: () => string
  sign: (payload: object) => Promise<string>
  saveProfile: (profile: Profile) => Promise<void>
  enqueueSync: (item: SyncQueueItem) => Promise<void>
  serialize: (payload: SignupPayload) => string
  generateId: () => string
}

export type OfflineSignupResult = {
  profile: Profile
  payload: SignupPayload
  queueItem: SyncQueueItem
}

export const startOfflineSignup = async (
  input: OfflineSignupInput,
  deps: OfflineSignupDeps
): Promise<OfflineSignupResult> => {
  const now = deps.now()
  const signupNonce = deps.generateNonce()

  const profile: Profile = {
    id: input.profileId,
    phone: input.phone,
    deviceId: input.deviceId,
    publicKey: input.publicKey,
    status: 'pending',
    kioskId: input.kioskId ?? null,
    verificationToken: null,
    createdAt: now,
    updatedAt: now,
  }

  const unsignedPayload = {
    version: 1,
    action: 'create_profile',
    profile,
    signup: {
      signupNonce,
      timestamp: now,
      channel: input.channel,
      signature: '',
    },
    meta: {
      deviceId: input.deviceId,
      appVersion: input.appVersion,
      retry: 0,
    },
  } as const

  const signature = await deps.sign(unsignedPayload)

  const payload: SignupPayload = {
    ...unsignedPayload,
    signup: {
      ...unsignedPayload.signup,
      signature,
    },
  }

  const queueItem: SyncQueueItem = {
    id: deps.generateId(),
    action: 'create_profile',
    payloadJson: deps.serialize(payload),
    status: 'pending',
    retryCount: 0,
    lastError: null,
    nextRetryAt: null,
    createdAt: now,
    updatedAt: now,
  }

  await deps.saveProfile(profile)
  await deps.enqueueSync(queueItem)

  return { profile, payload, queueItem }
}
