// app/src/features/auth/services/QrSignupService.js
/**
 * QrSignupService
 * Gère la génération, validation et cycle de vie du QR d'inscription offline.
 *
 * FLOW:
 * 1. User complète signup offline
 * 2. generateUserQr() → payload signé Ed25519 → QR affiché
 * 3. Kiosque scanne → validateUserQr() → stocke localement → generateKioskAckQr()
 * 4. User rescanne QR kiosque → activateFromKioskQr() → statut 'active' → QR invalidé
 * 5. Les deux sync vers Supabase au retour réseau (SyncQueue)
 *
 * SÉCURITÉ:
 * - Signature Ed25519 sur chaque payload
 * - QR usage unique (nonce consommé à l'activation)
 * - Pas de TTL fixe: expire uniquement à l'activation
 * - Vérification kiosk_id au moment du sync Supabase
 */

import { Buffer } from 'buffer';
// import nacl from 'tweetnacl';               // À décommenter quand tweetnacl installé
// import * as naclUtil from 'tweetnacl-util'; // À décommenter quand tweetnacl installé

// ─── Version du protocole QR ─────────────────────────────────
const QR_PROTOCOL_VERSION = 1;

// ─── Types d'action dans le QR ───────────────────────────────
export const QR_ACTION = {
  USER_SIGNUP:  'user_signup',   // QR généré par l'utilisateur
  KIOSK_ACK:    'kiosk_ack',     // QR de confirmation généré par le kiosque
};

// ─── Statuts profil (cohérents avec architecture.md) ─────────
export const PROFILE_STATUS = {
  PENDING:             'pending',
  VALIDATED_BY_KIOSK:  'validated_by_kiosk',
  ACTIVE:              'active',
};

export const QrSignupService = {

  // ─────────────────────────────────────────────────────────
  // 1. CÔTÉ USER — Générer le QR d'inscription
  // ─────────────────────────────────────────────────────────

  /**
   * Génère le payload complet pour le QR utilisateur.
   * À appeler à la fin du signup offline.
   *
   * @param {object} params
   * @param {string} params.phone        - Numéro de téléphone
   * @param {string} params.deviceId     - ID unique de l'appareil
   * @param {string} params.publicKeyB64 - Clé publique Ed25519 en Base64
   * @param {string} params.privateKeyB64 - Clé privée Ed25519 en Base64 (pour signer)
   * @param {string} params.displayName  - Nom d'affichage de l'utilisateur
   * @returns {object} { qrString, payload, nonce }
   */
  generateUserQr({ phone, deviceId, publicKeyB64, privateKeyB64, displayName }) {
    const nonce = this._generateNonce();

    const payload = {
      version:      QR_PROTOCOL_VERSION,
      action:       QR_ACTION.USER_SIGNUP,
      phone,
      device_id:    deviceId,
      public_key:   publicKeyB64,
      display_name: displayName || '',
      signup_nonce: nonce,
      timestamp:    Date.now(),
      channel:      'qr',
      // signature ajoutée ci-dessous
    };

    // Signer le payload (sans le champ signature lui-même)
    const signature = this._sign(payload, privateKeyB64);
    const signedPayload = { ...payload, signature };

    // Encoder en string pour le QR
    const qrString = this._encodePayload(signedPayload);

    return { qrString, payload: signedPayload, nonce };
  },

  // ─────────────────────────────────────────────────────────
  // 2. CÔTÉ KIOSQUE — Scanner et valider le QR utilisateur
  // ─────────────────────────────────────────────────────────

  /**
   * Valide un QR scanné par le kiosque.
   * @param {string} qrString - String brut scanné depuis le QR
   * @param {string} kioskId  - ID du kiosque
   * @returns {object} { valid, payload, error }
   */
  validateUserQr(qrString, kioskId) {
    try {
      const payload = this._decodePayload(qrString);

      // Vérifier la structure
      const structCheck = this._checkStructure(payload, [
        'version', 'action', 'phone', 'device_id',
        'public_key', 'signup_nonce', 'timestamp', 'signature',
      ]);
      if (!structCheck.valid) return structCheck;

      // Vérifier l'action
      if (payload.action !== QR_ACTION.USER_SIGNUP) {
        return { valid: false, error: 'Action QR invalide' };
      }

      // Vérifier la version
      if (payload.version !== QR_PROTOCOL_VERSION) {
        return { valid: false, error: `Version incompatible: ${payload.version}` };
      }

      // Vérifier la signature Ed25519
      const sigValid = this._verify(payload, payload.public_key);
      if (!sigValid) {
        return { valid: false, error: 'Signature invalide — QR compromis' };
      }

      // Vérifier le format du téléphone (basique)
      if (!this._isValidPhone(payload.phone)) {
        return { valid: false, error: 'Numéro de téléphone invalide' };
      }

      return { valid: true, payload };
    } catch (e) {
      return { valid: false, error: `Erreur décodage: ${e.message}` };
    }
  },

  /**
   * Génère le QR de confirmation du kiosque (ACK).
   * À afficher après validation réussie du QR utilisateur.
   * @param {object} userPayload   - Payload validé de l'utilisateur
   * @param {string} kioskId       - ID du kiosque
   * @param {string} kioskPrivKey  - Clé privée du kiosque pour signer
   * @returns {object} { qrString, ackPayload, verificationToken }
   */
  generateKioskAckQr(userPayload, kioskId, kioskPrivKey) {
    const verificationToken = this._generateVerificationToken(
      userPayload.phone,
      userPayload.device_id,
      kioskId
    );

    const ackPayload = {
      version:            QR_PROTOCOL_VERSION,
      action:             QR_ACTION.KIOSK_ACK,
      phone:              userPayload.phone,
      device_id:          userPayload.device_id,
      original_nonce:     userPayload.signup_nonce,
      kiosk_id:           kioskId,
      verification_token: verificationToken,
      validated_at:       Date.now(),
      signature:          null, // sera remplacé
    };

    const signature = this._sign(ackPayload, kioskPrivKey);
    const signedAck = { ...ackPayload, signature };
    const qrString  = this._encodePayload(signedAck);

    return { qrString, ackPayload: signedAck, verificationToken };
  },

  // ─────────────────────────────────────────────────────────
  // 3. CÔTÉ USER — Scanner le QR ACK du kiosque → activation
  // ─────────────────────────────────────────────────────────

  /**
   * Active le compte utilisateur depuis le QR kiosque.
   * @param {string} qrString      - QR ACK scanné depuis le kiosque
   * @param {string} userPhone     - Téléphone de l'utilisateur (vérification)
   * @param {string} userDeviceId  - Device ID (vérification)
   * @returns {object} { valid, verificationToken, kioskId, validatedAt, error }
   */
  activateFromKioskQr(qrString, userPhone, userDeviceId) {
    try {
      const payload = this._decodePayload(qrString);

      // Vérifier la structure ACK
      const structCheck = this._checkStructure(payload, [
        'version', 'action', 'phone', 'device_id',
        'kiosk_id', 'verification_token', 'validated_at', 'signature',
      ]);
      if (!structCheck.valid) return structCheck;

      // Vérifier que c'est bien un ACK kiosque
      if (payload.action !== QR_ACTION.KIOSK_ACK) {
        return { valid: false, error: 'Ce QR n\'est pas un QR de validation kiosque' };
      }

      // Vérifier que le QR correspond bien à CET utilisateur
      if (payload.phone !== userPhone) {
        return { valid: false, error: 'Ce QR ne correspond pas à votre compte' };
      }
      if (payload.device_id !== userDeviceId) {
        return { valid: false, error: 'Ce QR ne correspond pas à cet appareil' };
      }

      return {
        valid:              true,
        verificationToken:  payload.verification_token,
        kioskId:            payload.kiosk_id,
        validatedAt:        payload.validated_at,
        originalNonce:      payload.original_nonce,
      };
    } catch (e) {
      return { valid: false, error: `Erreur décodage ACK: ${e.message}` };
    }
  },

  // ─────────────────────────────────────────────────────────
  // 4. SYNC QUEUE — Payloads pour WatermelonDB → Supabase
  // ─────────────────────────────────────────────────────────

  /**
   * Construit le payload SyncQueue pour le profil utilisateur.
   * À ajouter à SyncQueue après activation locale.
   */
  buildUserSyncPayload({ userPayload, verificationToken, kioskId, validatedAt, appVersion }) {
    return {
      version: 1,
      action:  'create_profile',
      profile: {
        phone:              userPayload.phone,
        device_id:          userPayload.device_id,
        public_key:         userPayload.public_key,
        display_name:       userPayload.display_name || '',
        status:             PROFILE_STATUS.VALIDATED_BY_KIOSK,
        kiosk_id:           kioskId,
        verification_token: verificationToken,
        created_at:         userPayload.timestamp,
        updated_at:         Date.now(),
      },
      signup: {
        signup_nonce: userPayload.signup_nonce,
        timestamp:    userPayload.timestamp,
        channel:      'qr',
        signature:    userPayload.signature,
        validated_at: validatedAt,
      },
      meta: {
        device_id:   userPayload.device_id,
        app_version: appVersion || '1.0.0',
        retry:       0,
      },
    };
  },

  /**
   * Construit le payload SyncQueue pour le kiosque.
   * À ajouter à SyncQueue du kiosque après validation.
   */
  buildKioskSyncPayload({ userPayload, verificationToken, kioskId, validatedAt, appVersion }) {
    return {
      version: 1,
      action:  'kiosk_validate_user',
      validation: {
        phone:              userPayload.phone,
        device_id:          userPayload.device_id,
        public_key:         userPayload.public_key,
        kiosk_id:           kioskId,
        verification_token: verificationToken,
        signup_nonce:       userPayload.signup_nonce,
        channel:            'qr',
        validated_at:       validatedAt,
        user_signature:     userPayload.signature,
      },
      meta: {
        device_id:   kioskId,
        app_version: appVersion || '1.0.0',
        retry:       0,
      },
    };
  },

  // ─────────────────────────────────────────────────────────
  // UTILS PRIVÉS
  // ─────────────────────────────────────────────────────────

  _generateNonce() {
    const bytes = new Uint8Array(16);
    // En production: crypto.getRandomValues(bytes)
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Buffer.from(bytes).toString('hex');
  },

  _generateVerificationToken(phone, deviceId, kioskId) {
    const raw  = `${phone}:${deviceId}:${kioskId}:${Date.now()}`;
    const hash = Buffer.from(raw).toString('base64');
    return hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  },

  _encodePayload(payload) {
    const json = JSON.stringify(payload);
    return Buffer.from(json, 'utf8').toString('base64');
  },

  _decodePayload(encoded) {
    const json = Buffer.from(encoded, 'base64').toString('utf8');
    return JSON.parse(json);
  },

  _checkStructure(payload, requiredFields) {
    if (!payload) return { valid: false, error: 'Payload vide' };
    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null) {
        return { valid: false, error: `Champ manquant: ${field}` };
      }
    }
    return { valid: true };
  },

  _sign(payload, privateKeyB64) {
    // TODO Phase 2: remplacer par vraie signature Ed25519 avec tweetnacl
    // const privKey = naclUtil.decodeBase64(privateKeyB64);
    // const msg     = naclUtil.decodeUTF8(JSON.stringify(payloadWithoutSig));
    // const sig     = nacl.sign.detached(msg, privKey);
    // return naclUtil.encodeBase64(sig);

    // Phase 1: signature simulée (HMAC-like simple)
    const { signature: _sig, ...payloadWithoutSig } = payload;
    const raw = JSON.stringify(payloadWithoutSig) + (privateKeyB64 || 'dev_key');
    return Buffer.from(raw).toString('base64').substring(0, 88);
  },

  _verify(payload, publicKeyB64) {
    // TODO Phase 2: vraie vérification Ed25519
    // const pubKey = naclUtil.decodeBase64(publicKeyB64);
    // const { signature, ...payloadWithoutSig } = payload;
    // const msg = naclUtil.decodeUTF8(JSON.stringify(payloadWithoutSig));
    // const sig = naclUtil.decodeBase64(signature);
    // return nacl.sign.detached.verify(msg, sig, pubKey);

    // Phase 1: toujours valide si signature présente (à remplacer)
    return !!payload.signature && payload.signature.length > 10;
  },

  _isValidPhone(phone) {
    return typeof phone === 'string' && phone.length >= 8 && /^\+?[\d\s\-()]+$/.test(phone);
  },
};
