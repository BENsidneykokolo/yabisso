// app/src/features/loba/services/RecommendationEngine.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

/**
 * RecommendationEngine
 * Gère le filtrage des contenus P2P basés sur les intérêts de l'utilisateur (Règle 95/5).
 */
export const RecommendationEngine = {

  /**
   * Filtre et trie une liste de médias (Delta) selon les intérêts locaux.
   * @param {Array} delta - Liste des médias provenant du Manifest distant
   * @param {Object} localInterests - Map des intérêts { 'sport': 0.60, ... }
   */
  filterAndPrioritize(delta, localInterests) {
    if (!delta || delta.length === 0) return [];
    
    // 1. Calcul des parts 95% / 5%
    const totalToKeep = delta.length;
    const affinityCount = Math.floor(totalToKeep * 0.95);
    const discoveryCount = totalToKeep - affinityCount;

    // 2. Séparation par affinité
    const affinityItems = delta.filter(m => localInterests[m.category] && localInterests[m.category] > 0.1);
    const discoveryItems = delta.filter(m => !localInterests[m.category] || localInterests[m.category] <= 0.1);

    // 3. Mélange et sélection
    // On garde les meilleurs affinityItems (95%) et quelques discovery (5%)
    const selectedAffinity = affinityItems.slice(0, affinityCount);
    const selectedDiscovery = discoveryItems.slice(0, discoveryCount);

    const finalSelection = [...selectedAffinity, ...selectedDiscovery];

    // 4. Tri final par TAILLE croissante (pour maximiser la variété en cas de coupure)
    return finalSelection.sort((a, b) => a.size - b.size);
  },

  /**
   * Met à jour le profil d'intérêts suite à un feedback utilisateur.
   * @param {string} category 
   * @param {string} action - 'like' | 'dislike' | 'ignore'
   */
  async updateInterest(category, action) {
    try {
      await database.write(async () => {
        const interests = await database.get('user_interests')
          .query(Q.where('category', category), Q.where('service', 'loba'))
          .fetch();

        let interest;
        if (interests.length > 0) {
          interest = interests[0];
          await interest.update(i => {
            if (action === 'like') i.weight = Math.min(1.0, i.weight + 0.05);
            if (action === 'dislike') i.weight = Math.max(0.0, i.weight - 0.10);
            if (action === 'ignore') i.weight = Math.max(0.0, i.weight - 0.01);
          });
        } else if (action === 'like') {
          // Création si nouvelle catégorie aimée (Discovery)
          await database.get('user_interests').create(i => {
            i.service = 'loba';
            i.category = category;
            i.weight = 0.10;
          });
        }
      });
    } catch (e) {
      console.error('[RecommendationEngine] Erreur update:', e);
    }
  }
};
