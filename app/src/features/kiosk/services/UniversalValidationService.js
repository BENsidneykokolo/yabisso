// app/src/features/kiosk/services/UniversalValidationService.js
import { Buffer } from 'buffer';

/**
 * UniversalValidationService
 * Gère la validation cryptographique et métier de n'importe quel service (Marché, Hôtel, Restaurant, etc.)
 */

export const VALIDATION_TYPES = {
  MARKETPLACE_PRODUCT: 'marketplace_product',
  HOTEL_ROOM:          'hotel_room',
  RESTAURANT_DISH:     'restaurant_dish',
  SERVICE_BOOKING:     'service_booking',
  REAL_ESTATE:         'real_estate_listing',
  TRANSPORT_TICKET:    'transport_ticket',
  POINTS_RECHARGE:     'points_recharge',
  PACKS_RECHARGE:      'packs_recharge',
  USER_MANAGEMENT:     'user_management',
};

export const UniversalValidationService = {
  /**
   * Valide un QR scanné provenant d'un vendeur/prestataire.
   * @param {string} qrString - String Base64 du QR
   * @returns {object} { valid, payload, error, type }
   */
  validateServiceQr(qrString) {
    try {
      if (!qrString) throw new Error('QR vide');

      const payload = this._decodePayload(qrString);

      // 1. Vérification structure de base
      const required = ['id', 'type', 'name', 'price', 'sellerId', 'signature'];
      for (const field of required) {
        if (!payload[field]) throw new Error(`Champ manquant: ${field}`);
      }

      // 2. Vérification du type (doit être supporté)
      const isSupported = Object.values(VALIDATION_TYPES).includes(payload.type) || payload.type === 'product_validation';
      if (!isSupported) {
        throw new Error(`Type de service non supporté: ${payload.type}`);
      }

      // 3. TODO: Vérification signature Ed25519 du vendeur
      // Pour Phase 1, on valide la présence d'une signature
      if (payload.signature.length < 10) {
        throw new Error('Signature du vendeur invalide ou absente');
      }

      return {
        valid: true,
        payload,
        type: payload.type,
      };
    } catch (e) {
      return {
        valid: false,
        error: e.message,
      };
    }
  },

  /**
   * Simule la signature du kiosque pour valider le contenu.
   * En prod, cela génère un nouveau payload signé par le kiosque pour la propagation mesh.
   */
  async signValidation(payload, kioskId, kioskPrivKey) {
    // En production, on utiliserait tweetnacl pour signer le hash du payload
    // Ici on simule une signature cryptographique pour la propagation Mesh
    return {
      ...payload,
      isValidated: true,
      validatedBy: kioskId,
      validatedAt: Date.now(),
      kioskSignature: 'sig_kiosk_' + Buffer.from(payload.id + kioskId + Date.now()).toString('hex').substring(0, 32),
      propagationMode: 'COMMERCIAL_VALIDATED',
    };
  },

  /**
   * Helper pour décoder le payload
   */
  _decodePayload(encoded) {
    try {
      // On tente de voir si c'est du JSON direct ou du Base64
      if (encoded.startsWith('{')) return JSON.parse(encoded);
      const json = Buffer.from(encoded, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch (e) {
      // Fallback si c'est déjà un objet (test mode)
      if (typeof encoded === 'object') return encoded;
      throw new Error('Format de données invalide');
    }
  },
};
