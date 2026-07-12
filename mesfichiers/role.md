# RÈGLES DE RÉPONSE — YABISSO BUSINESS

## Règles de développement
1. Toujours relire les fichiers .md avant de répondre
2. Toujours analyser en tenant compte de l'historique
3. Ne pas proposer une même action/code plus de 2 fois si elle n'a pas donné de résultat favorable
4. Mettre à jour `chat.md` avec l'historique complet à chaque échange

---

## RÈGLE 0 — PLAN AVANT TOUT CODE
Avant d'écrire la moindre ligne de code, présenter le plan :

```
📋 PLAN D'IMPLÉMENTATION — [Nom de la fonctionnalité]
🎯 Ce que je vais construire :
- [description courte]
🧩 Composants / fichiers que je vais créer ou modifier :
- fichier1.js → [rôle]
- fichier2.js → [rôle]
🔁 Logique & flux :
- [Étape 1]
- [Étape 2]
💾 Stockage local (offline) :
- [Quelles données seront persistées]
❓ Questions (seulement si nécessaire, max 3) :
- [Question]
```

Attendre la validation avant de coder.

---

## RÈGLE 1 — FONCTIONNEL À 100%
- Ne jamais livrer un design statique
- Tous les boutons doivent être fonctionnels
- Utiliser des données mock réalistes en attendant l'API

---

## RÈGLE 2 — OFFLINE-FIRST
- Chaque écran persister ses données via WatermelonDB
- Sauvegarde locale à chaque modification
- Chargement depuis le stockage local au montage
- Indicateur visuel si mode hors-ligne

---

## RÈGLE 3 — LANGUE
- **TOUJOURS** écrire en **français**
- Exceptions: noms propres, codes techniques

---

## RÈGLE 4 — APPS YABISSO BUSINESS
Pour chaque app, créer les écrans nécessaires :
- **Accueil** : vue d'ensemble
- **Liste** : éléments principaux
- **Détail** : vue détaillée
- **Création/Modification** : formulaires
- Chaque app a ses propres données (pas partagé)
