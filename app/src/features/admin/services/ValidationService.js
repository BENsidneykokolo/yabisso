// app/src/features/admin/services/ValidationService.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

/**
 * ValidationService
 * Gère le workflow de validation par les Admins (Kiosk, Main, Super)
 * pour autoriser la propagation des contenus sur le Mesh Global.
 */
export const ValidationService = {
  
  /**
   * Génère le payload qu'un vendeur affiche en QR Code
   * pour demander la validation de son produit.
   * @param {string} tableName - ex: 'products', 'restaurants'
   * @param {string} itemId - l'ID de l'élément
   */
  async generateValidationPayload(tableName, itemId) {
    try {
      const records = await database.get(tableName).query(Q.where('id', itemId)).fetch();
      if (records.length === 0) throw new Error('Item not found');
      
      const record = records[0];
      
      return JSON.stringify({
        action: 'REQUEST_VALIDATION',
        table: tableName,
        id: itemId,
        hash: record.hash, // Si applicable
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('[ValidationService] Erreur génération payload:', e.message);
      return null;
    }
  },

  /**
   * Appelé par l'appareil de l'Admin après avoir scanné le QR Code.
   * L'Admin approuve et envoie un signal P2P (ou API) au vendeur.
   * @param {Object} payload - Le payload scanné
   * @param {string} adminId - L'ID du Kiosque ou de l'Admin
   */
  async approveValidationRequest(payload, adminId) {
    try {
      if (payload.action !== 'REQUEST_VALIDATION') return false;

      // TODO: Logique pour envoyer un message P2P "VALIDATED" au vendeur
      // via NearbyMeshService ou un canal sécurisé.
      
      // Simulation pour le code source actuel :
      console.log(`[ValidationService] Approbation générée pour ${payload.table}:${payload.id} par ${adminId}`);
      
      return {
        action: 'VALIDATED',
        table: payload.table,
        id: payload.id,
        validated_by: adminId,
        timestamp: Date.now()
      };
    } catch (e) {
      console.error('[ValidationService] Erreur approbation:', e.message);
      return false;
    }
  },

  /**
   * Appelé par le Vendeur quand il reçoit le signal de validation de l'Admin.
   * Modifie la base de données locale (is_validated = true), ce qui débloque
   * la propagation dans le GlobalManifestService.
   */
  async applyValidation(validationData) {
    try {
      if (validationData.action !== 'VALIDATED') return false;

      await database.write(async () => {
        const records = await database.get(validationData.table)
          .query(Q.where('id', validationData.id))
          .fetch();

        if (records.length > 0) {
          await records[0].update(record => {
            record.isValidated = true;
            record.validatedBy = validationData.validated_by;
            // On peut aussi trigger une synchro cloud si internet est dispo
          });
          console.log(`[ValidationService] ✅ Article validé avec succès (${validationData.id}). Il est maintenant diffusable.`);
        }
      });
      return true;
    } catch (e) {
      console.error('[ValidationService] Erreur application validation:', e.message);
      return false;
    }
  }
};
