# REGLES DE REPONSE

## Règles de développement
1. Toujours relire tous les fichiers .md avant de repondre.
2. Toujours analyser en tenant compte de l'historique.
3. Ne pas proposer une meme action/code plus de 2 fois si elle n'a pas donne de resultat favorable.
   Exception: on peut re-proposer si changement ou ajout dans le code.
4. Mettre a jour `chat.md` avec l'historique complet a chaque echange.

---

## Fonctionnalité — Gestion des Adresses

### Description
Système d'adresses multiples pour les utilisateurs Yabisso, adapté au contexte africain (Afrique subsaharienne, notamment Congo où les adresses sont rares).

### Spécifications

#### Profil utilisateur
- **Données d'inscription** (affichées dans "Moi") :
  - Numéro de téléphone
  - Nom et prénom
  - Ces données proviennent de l'inscription

#### Gestion des adresses
- L'utilisateur peut ajouter une adresse après le signup
- Emplacement dans le profil : section "Adresse"
- Options pour ajouter une adresse :
  - Entrer manuellement (si connu)
  - Lancer la géolocalisation (précise, nécessite internet/Google Maps)

#### Types d'adresses
L'utilisateur peut nommer ses adresses :
- Maison
- Travail
- Entrer un nom personnalisé (ex: salle de gym, maison de la mère, etc.)

#### Génération automatique
Chaque adresse enregistrée génère :
- Un **numéro unique** (ex: YAB-ADDR-XXXXXXXX)
- Un **QR code unique** pour l'adresse

#### Partage d'adresses
Options de partage :
1. **Via message** : lien Google Maps envoyé, mais le receveur voit uniquement le nom (ex: "Maison")
2. **Via QR code** : scanner le QR de l'adresse
3. **Via numéro unique** : communiquer le numéro YAB-ADDR-XXXXXXX
4. **Via réseaux** : WhatsApp, Facebook, Loba, chat interne Yabisso, SMS, etc.

#### Contraintes techniques
- Géolocalisation nécessite une connexion internet (Google Maps)
- Stockage local des adresses (WatermelonDB)
- Sync vers Supabase quand connexion disponible

---

## Règles de développement (OBLIGATOIRES)

### ÉTAPE 0 — PLAN AVANT TOUT CODE (OBLIGATOIRE)
Avant d'écrire la moindre ligne de code, tu dois toujours présenter ton plan sous ce format :

```
📋 PLAN D'IMPLÉMENTATION — [Nom de la fonctionnalité]
🎯 Ce que je vais construire :
- [description courte de ce qui sera livré]
🧩 Composants / fichiers que je vais créer ou modifier :
- fichier1.tsx → [rôle]
- fichier2.tsx → [rôle]
🔁 Logique & flux :
- [Étape 1 : ex. l'utilisateur clique sur "Ajouter au panier"]
- [Étape 2 : ex. le produit est sauvegardé dans AsyncStorage]
- [Étape 3 : ex. le compteur du panier se met à jour]
💾 Stockage local (offline) :
- [Quelles données seront persistées et comment]
💳 Paiement (si applicable) :
- [Quel scénario de paiement sera implémenté et comment]
❓ Questions (seulement si vraiment nécessaire, max 3) :
- [Question 1 si ambiguïté bloquante]
```

Tu attends la réponse de l'utilisateur avant de coder.
Si l'utilisateur dit "ok", "go", "valide" ou équivalent → tu codes.
Si l'utilisateur corrige quelque chose → tu mets à jour le plan et redemandes confirmation.

---

### RÈGLE 1 — FONCTIONNEL À 100% DÈS LA PREMIÈRE LIVRAISON
- Ne jamais livrer un design statique ou une maquette vide.
- Tous les boutons doivent être fonctionnels : navigation réelle, actions réelles.
- Exemple : bouton "Checkout" → ouvre écran Checkout. Bouton "−/+" → modifie quantité. Clic produit → page détail.
- Utiliser des données mock réalistes en attendant l'API.
- Un seul livrable = design + fonctionnel + offline + paiement si applicable.

---

### RÈGLE 2 — OFFLINE-FIRST / STOCKAGE LOCAL
- Chaque écran doit persister ses données via AsyncStorage (ou WatermelonDB si déjà en place).
- Panier, favoris, sessions, préférences : tout survit à une déconnexion.
- Structure minimale automatique :
  - Sauvegarde locale à chaque modification d'état
  - Chargement depuis le stockage local au montage
  - Indicateur visuel si mode hors-ligne actif
- L'app doit fonctionner complètement sans internet.

---

### RÈGLE 3 — LOGIQUE MÉTIER INTÉGRÉE AUTOMATIQUEMENT
Pour chaque fonctionnalité connue du projet, intègre directement la bonne logique sans attendre qu'on te le demande :
- **Paiement QR code** → génération QR avec montant + ID commande, attente confirmation, écran succès/échec
- **Paiement direct** → saisie, validation, confirmation
- **Inscription offline avec QR code** → génération QR d'identité, validation locale, sync différée
- **Validation offline** → logique de file d'attente, sync quand connexion revenue
- Et toute autre logique documentée dans les fichiers .md du projet

Si un scénario est documenté dans les fichiers du projet → tu l'implémentes directement.
Si un scénario est ambigu → tu le mentionnes dans le plan (Étape 0) et tu poses max 2-3 questions.

---

### RÈGLE 4 — COMPORTEMENT GÉNÉRAL
- Toujours commencer par l'Étape 0 (plan) avant tout code.
- Ne jamais faire deux passes (design d'abord, fonctionnel ensuite).
- Poser les questions DANS le plan, jamais après avoir codé.
- Attendre la validation avant de démarrer l'implémentation.

---

### RÈGLE 5 — LANGUE
- **TOUJOURS** écrire tous les écrans en **français** (labels, boutons, messages, titres)
- Exceptions: noms propres, marques, codes techniques (QR, ID)
- Mettre à jour les texts anglais existants vers français

---

### RÈGLE 6 — ÉCRANS PAR SERVICE
Pour chaque service (Restaurant, Marketplace, etc.), créer les écrans nécessaires:
- **Commandes** : liste des commandes en cours/terminées
- **Panier** : gestion du panier (ajouter, supprimer, quantité)
- **Suivi** : tracking de livraison en temps réel
- **Historique** : historique des commandes passées
- Chaque service a son propre panier et ses propres commandes (pas partagé)

---

### RÈGLE 7 — NOM DE BOUTIQUE DYNAMIQUE
- Le nom de la boutique doit être récupéré depuis SecureStore (`seller_shop_info`)
- Tous les écrans du parcours achat (produit, panier, paiement) doivent afficher le vrai nom de la boutique
- Fallback: "Ma Boutique" si non défini
