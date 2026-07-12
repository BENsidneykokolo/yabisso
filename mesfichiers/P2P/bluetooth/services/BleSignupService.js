// app/src/features/bluetooth/services/BleSignupService.js
import { Buffer } from 'buffer';

/**
 * BleSignupService
 * Encode/Decode les payloads de signup pour transmission BLE.
 * Les caracteristiques BLE ont une MTU typique de 20-512 bytes.
 * On split le payload en chunks de 180 bytes (safe cross-device).
 */
const CHUNK_SIZE = 180; // bytes, safe pour MTU 23 minimum

export const BleSignupService = {
  /**
   * Encode un payload signup en tableau de chunks Base64
   * Format: JSON -> UTF8 -> Base64 -> split chunks
   */
  encodePayload(payload) {
    const json    = JSON.stringify(payload);
    const b64     = Buffer.from(json, 'utf8').toString('base64');
    const chunks  = [];

    // Prefix chaque chunk: "IDX/TOTAL:DATA"
    const total   = Math.ceil(b64.length / CHUNK_SIZE);
    for (let i = 0; i < total; i++) {
      const slice = b64.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const frame = `${i + 1}/${total}:${slice}`;
      // Re-encode le frame en Base64 pour writeCharacteristic
      chunks.push(Buffer.from(frame, 'utf8').toString('base64'));
    }

    return chunks;
  },

  /**
   * Décode un chunk reçu, retourne { index, total, slice }
   */
  decodeChunk(b64Value) {
    try {
      const frame = Buffer.from(b64Value, 'base64').toString('utf8');
      const colonIdx = frame.indexOf(':');
      if (colonIdx === -1) return null;

      const header = frame.substring(0, colonIdx);
      const slice  = frame.substring(colonIdx + 1);
      const [idx, total] = header.split('/').map(Number);

      return { index: idx, total, slice };
    } catch {
      return null;
    }
  },

  /**
   * Reconstruit le payload complet à partir des chunks reçus
   * chunks: Map<index, slice>
   */
  reconstructPayload(chunksMap, total) {
    let b64 = '';
    for (let i = 1; i <= total; i++) {
      if (!chunksMap.has(i)) return null; // manquant
      b64 += chunksMap.get(i);
    }
    try {
      const json = Buffer.from(b64, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  /**
   * Encode un ACK (verification_token) en Base64 pour writeCharacteristic
   */
  encodeAck(ackPayload) {
    const json = JSON.stringify(ackPayload);
    return Buffer.from(json, 'utf8').toString('base64');
  },

  /**
   * Décode un ACK reçu
   */
  decodeAck(b64Value) {
    try {
      const json = Buffer.from(b64Value, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  /**
   * Valide la structure minimale d'un payload signup
   */
  validatePayload(payload) {
    if (!payload) return { valid: false, reason: 'Payload vide' };

    const required = ['version', 'action', 'phone', 'device_id', 'public_key', 'signup_nonce', 'timestamp', 'signature'];
    for (const field of required) {
      if (!payload[field]) {
        return { valid: false, reason: `Champ manquant: ${field}` };
      }
    }

    // Vérifier TTL (5 minutes)
    const TTL_MS = 5 * 60 * 1000;
    if (Date.now() - payload.timestamp > TTL_MS) {
      return { valid: false, reason: 'Payload expiré (TTL dépassé)' };
    }

    // Vérifier version
    if (payload.version !== 1) {
      return { valid: false, reason: `Version incompatible: ${payload.version}` };
    }

    return { valid: true };
  },

  /**
   * Génère un verification_token simple (à remplacer par Ed25519 en Phase 2)
   */
  generateVerificationToken(phone, deviceId) {
    const raw = `${phone}:${deviceId}:${Date.now()}:${Math.random()}`;
    return Buffer.from(raw).toString('base64').substring(0, 32);
  },
};
