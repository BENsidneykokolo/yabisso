// app/src/features/kiosk/services/OfflineValidationService.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import * as SecureStore from 'expo-secure-store';

/**
 * OfflineValidationService
 * Gère la validation offline des produits/services par un kiosque/admin
 * 
 * Flow:
 * 1. Vendeur crée produit/service → status: pending
 * 2. Kiosque scanne QR ou reçoit via P2P → status: pending_validation
 * 3. Kiosque valide → status: validated (visible par tous)
 * 4. Propagation mesh vers autres utilisateurs
 */

export const VALIDATION_STATUS = {
  PENDING: 'pending',           // En attente de validation
  PENDING_VALIDATION: 'pending_validation',  // Envoyé pour validation
  VALIDATED: 'validated',      // Validated par kiosque/admin
  REJECTED: 'rejected',        // Rejeté
};

export const SERVICE_TYPES = {
  MARKETPLACE: 'marketplace',
  RESTAURANT: 'restaurant',
  SERVICES: 'services',
  HOTEL: 'hotel',
  REAL_ESTATE: 'real_estate',
};

export const OfflineValidationService = {
  /**
   * Crée une demande de validation pour un produit/service
   * @param {string} serviceType - Type de service (marketplace, restaurant, etc.)
   * @param {object} data - Données du produit/service
   * @returns {Promise<object>}
   */
  async createValidationRequest(serviceType, data) {
    try {
      const validationId = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Sauvegarder localement
      await database.write(async () => {
        // Utilise la table sync_queue pour stocker les validations en attente
        await database.get('sync_queue').create(sq => {
          sq.action = `validation_request_${serviceType}`;
          sq.payloadJson = JSON.stringify({
            validationId,
            serviceType,
            data,
            status: VALIDATION_STATUS.PENDING_VALIDATION,
            createdAt: Date.now(),
            sellerId: data.sellerId || 'local',
            sellerName: data.sellerName || '',
          });
          sq.status = VALIDATION_STATUS.PENDING_VALIDATION;
          sq.retryCount = 0;
          sq.createdAt = Date.now();
          sq.updatedAt = Date.now();
        });
      });

      // Générer le QR code pour validation
      const qrPayload = this.generateValidationQR(serviceType, {
        validationId,
        ...data,
      });

      console.log(`[OfflineValidation] Demande créée: ${validationId}`);
      return { success: true, validationId, qrPayload };
    } catch (e) {
      console.error('[OfflineValidation] Erreur createValidationRequest:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Génère le QR code de validation
   */
  generateValidationQR(serviceType, data) {
    const payload = {
      id: data.validationId || `val_${Date.now()}`,
      type: `validation_request_${serviceType}`,
      name: data.name || data.title || 'Produit',
      price: data.price || '0',
      sellerId: data.sellerId || 'local',
      sellerName: data.sellerName || '',
      description: data.description || '',
      category: data.category || '',
      serviceType,
      createdAt: Date.now(),
      signature: this.generateMockSignature(data),
    };

    return btoa(JSON.stringify(payload));
  },

  /**
   * Génère une signature mock (en prod: Ed25519)
   */
  generateMockSignature(data) {
    const str = `${data.name}_${data.sellerId}_${Date.now()}`;
    return `sig_${btoa(str).substring(0, 32)}`;
  },

  /**
   * Valide un QR code reçu d'un vendeur
   * @param {string} qrString - Contenu du QR
   * @returns {object}
   */
  async validateQR(qrString) {
    try {
      const payload = JSON.parse(atob(qrString));
      
      if (!payload.id || !payload.type || !payload.name) {
        throw new Error('QR invalide');
      }

      // Vérifier que c'est bien une demande de validation
      if (!payload.type.startsWith('validation_request_')) {
        throw new Error('Ce QR n\'est pas une demande de validation');
      }

      // Extraire le type de service
      const serviceType = payload.type.replace('validation_request_', '');

      return {
        valid: true,
        payload,
        serviceType,
      };
    } catch (e) {
      return {
        valid: false,
        error: e.message,
      };
    }
  },

  /**
   * Approuve une demande de validation (kiosque/admin)
   * @param {object} payload - Données validées du QR
   * @param {string} validatorId - ID du validateur (kiosque/admin)
   * @returns {Promise<object>}
   */
  async approveValidation(payload, validatorId) {
    try {
      const serviceType = payload.serviceType;
      
      // Marquer comme validé dans la sync queue
      await database.write(async () => {
        // Chercher la demande de validation correspondante
        const pendingItems = await database.get('sync_queue')
          .query(
            Q.where('status', VALIDATION_STATUS.PENDING_VALIDATION),
            Q.where('action', Q.like(`%validation_request_${serviceType}%`))
          )
          .fetch();

        // Mettre à jour le status
        for (const item of pendingItems) {
          const itemData = JSON.parse(item.payloadJson);
          if (itemData.validationId === payload.id) {
            await item.update(sq => {
              sq.status = VALIDATION_STATUS.VALIDATED;
              sq.updatedAt = Date.now();
            });
          }
        }
      });

      // Mettre à jour le produit/service directement selon le type
      await this.updateServiceStatus(serviceType, payload.id, VALIDATION_STATUS.VALIDATED, validatorId);

      // Générer un QR de confirmation pour le vendeur
      const confirmationQR = this.generateConfirmationQR(payload, validatorId);

      console.log(`[OfflineValidation] Validated: ${payload.id} by ${validatorId}`);
      return { success: true, confirmationQR };
    } catch (e) {
      console.error('[OfflineValidation] Erreur approve:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Rejette une demande de validation
   */
  async rejectValidation(payload, validatorId, reason) {
    try {
      const serviceType = payload.serviceType;
      
      await this.updateServiceStatus(serviceType, payload.id, VALIDATION_STATUS.REJECTED, validatorId);

      console.log(`[OfflineValidation] Rejected: ${payload.id} reason: ${reason}`);
      return { success: true };
    } catch (e) {
      console.error('[OfflineValidation] Erreur reject:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Met à jour le statut du service selon le type
   */
  async updateServiceStatus(serviceType, itemId, status, validatorId) {
    try {
      let tableName = '';
      let statusField = '';

      switch (serviceType) {
        case SERVICE_TYPES.MARKETPLACE:
          tableName = 'products';
          statusField = 'productSyncStatus';
          break;
        case SERVICE_TYPES.RESTAURANT:
          tableName = 'restaurants';
          statusField = 'syncStatus';
          break;
        case SERVICE_TYPES.SERVICES:
          tableName = 'courses';
          statusField = 'syncStatus';
          break;
        case SERVICE_TYPES.HOTEL:
          tableName = 'hotels';
          statusField = 'syncStatus';
          break;
        case SERVICE_TYPES.REAL_ESTATE:
          tableName = 'properties';
          statusField = 'syncStatus';
          break;
        default:
          console.log(`[OfflineValidation] Type non reconnu: ${serviceType}`);
          return;
      }

      await database.write(async () => {
        const items = await database.get(tableName).query().fetch();
        for (const item of items) {
          // Trouver par ID ou par nom/price (selon le contexte)
          if (item.id === itemId || item.name === itemId) {
            await item.update(record => {
              if (statusField === 'productSyncStatus') {
                record.productSyncStatus = status;
              } else {
                record.syncStatus = status;
              }
              record.isValidated = status === VALIDATION_STATUS.VALIDATED;
              if (validatorId) {
                record.validatedBy = validatorId;
              }
            });
            break;
          }
        }
      });
    } catch (e) {
      console.error(`[OfflineValidation] Erreur updateServiceStatus:`, e);
    }
  },

  /**
   * Génère le QR de confirmation après validation
   */
  generateConfirmationQR(originalPayload, validatorId) {
    const payload = {
      id: originalPayload.id,
      type: 'validation_confirmed',
      serviceType: originalPayload.serviceType,
      status: VALIDATION_STATUS.VALIDATED,
      validatedBy: validatorId,
      validatedAt: Date.now(),
      confirmationSignature: this.generateMockSignature({ ...originalPayload, validated: true }),
    };

    return btoa(JSON.stringify(payload));
  },

  /**
   * Charge les produits/services en attente de validation
   */
  async getPendingValidations(serviceType = null) {
    try {
      const pending = await database.get('sync_queue')
        .query(Q.where('status', VALIDATION_STATUS.PENDING_VALIDATION))
        .fetch();

      const validations = pending
        .filter(item => {
          if (serviceType) {
            return item.action.includes(serviceType);
          }
          return item.action.includes('validation_request');
        })
        .map(item => JSON.parse(item.payloadJson));

      return validations;
    } catch (e) {
      console.error('[OfflineValidation] Erreur getPending:', e);
      return [];
    }
  },

  /**
   * Charge les produits validés pour affichage public
   */
  async getValidatedItems(serviceType) {
    try {
      let tableName = '';
      let statusField = '';

      switch (serviceType) {
        case SERVICE_TYPES.MARKETPLACE:
          tableName = 'products';
          statusField = 'productSyncStatus';
          break;
        case SERVICE_TYPES.RESTAURANT:
          tableName = 'restaurants';
          statusField = 'syncStatus';
          break;
        case SERVICE_TYPES.SERVICES:
          tableName = 'courses';
          statusField = 'syncStatus';
          break;
        default:
          return [];
      }

      const items = await database.get(tableName)
        .query(Q.where(statusField, VALIDATION_STATUS.VALIDATED))
        .fetch();

      return items;
    } catch (e) {
      console.error('[OfflineValidation] Erreur getValidatedItems:', e);
      return [];
    }
  },

  /**
   * Vérifie le statut de validation d'un produit
   */
  async checkValidationStatus(serviceType, itemId) {
    try {
      const validations = await this.getPendingValidations(serviceType);
      const validation = validations.find(v => v.validationId === itemId);
      
      if (validation) {
        return validation.status;
      }
      
      return VALIDATION_STATUS.VALIDATED; // Par défaut, considérer comme validé si pas en attente
    } catch (e) {
      return VALIDATION_STATUS.PENDING;
    }
  },

  /**
   * Reçoit une validation via P2P (WiFi Direct / BLE)
   */
  async receiveValidationFromP2P(data) {
    try {
      // Les données reçues sont déjà validées par le validateur
      const { serviceType, validationId, validatedBy, validatedAt } = data;
      
      await this.updateServiceStatus(serviceType, validationId, VALIDATION_STATUS.VALIDATED, validatedBy);
      
      console.log(`[OfflineValidation] Reçu validation via P2P: ${validationId}`);
      return { success: true };
    } catch (e) {
      console.error('[OfflineValidation] Erreur receiveP2P:', e);
      return { success: false, error: e.message };
    }
  },
};

export default OfflineValidationService;