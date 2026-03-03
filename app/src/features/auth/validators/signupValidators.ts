import type { SignupPayload } from '../schemas/signupPayload'

export const isValidSignupPayload = (payload: SignupPayload): boolean => {
  if (!payload) return false
  if (payload.version !== 1) return false
  if (!payload.action) return false
  if (!payload.profile?.id) return false
  if (!payload.profile?.phone) return false
  if (!payload.profile?.deviceId) return false
  if (!payload.profile?.publicKey) return false
  if (!payload.profile?.status) return false
  if (!payload.signup?.signupNonce) return false
  if (!payload.signup?.timestamp) return false
  if (!payload.signup?.channel) return false
  if (!payload.signup?.signature) return false
  if (!payload.meta?.deviceId) return false
  if (!payload.meta?.appVersion) return false
  if (typeof payload.meta?.retry !== 'number') return false
  return true
}
