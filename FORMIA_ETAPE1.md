# FormIA - Étape 1 : Multi-agences + Base chantiers ✅

## 🎯 Ce qui a été ajouté

### 1. **Système multi-agences**
- Les entités peuvent maintenant avoir plusieurs agences
- Chaque agence a son adresse, téléphone, email
- Flow de sélection : Entité → Agence → Type document

### 2. **Base de données chantiers**
- Table complète des chantiers/affaires
- Code chantier, client, adresse, responsable, emails
- Auto-remplissage du formulaire depuis code chantier

### 3. **Interface d'administration**
- Page `/formia/admin` pour gérer agences et chantiers
- CRUD complet (Créer, Modifier, Supprimer)

## 📋 Configuration Supabase (OBLIGATOIRE)

### Exécuter le nouveau schéma SQL

1. Allez sur https://supabase.com/dashboard
2. SQL Editor → Nouvelle requête
3. Copiez le contenu de `/app/lib/formia-schema-extension.sql`
4. Exécutez (Run)

Cela va créer :
- ✅ Table `formia_agencies` (agences)
- ✅ Table `formia_chantiers` (chantiers)
- ✅ Une agence exemple pour ALLEZ ENERGIES
- ✅ Un chantier exemple

## 🚀 Utilisation

### A. Ajouter vos agences

1. Allez sur : `https://taskia-pdf-builder.preview.emergentagent.com/formia/admin`
2. Onglet **Agences**
3. Cliquez sur **Nouvelle agence**
4. Remplissez :
   - Nom (ex: Agence La Roche-sur-Yon)
   - Code (ex: LRY)
   - Adresse complète
   - Téléphone et email
5. Enregistrer

**Exemple pour ALLEZ ENERGIES (12 agences) :**
- Agence Saint-Gilles-Croix-de-Vie (déjà créée)
- Agence La Roche-sur-Yon
- Agence Nantes
- Agence Angers
- etc.

### B. Ajouter vos chantiers

1. Même page admin, onglet **Chantiers**
2. Cliquez sur **Nouveau chantier**
3. Remplissez :
   - **Code chantier** (ex: GX265947VEN)
   - **Nom client** (ex: Camping Bel Air)
   - **Adresse complète**
   - **Agence rattachée** (sélection)
   - **Responsable d'affaire** (ex: Justine Palette)
   - **Emails** (séparés par virgules)
4. Enregistrer

### C. Créer un rapport avec auto-remplissage

1. Allez sur `/formia`
2. Sélectionnez **ALLEZ ENERGIES**
3. Sélectionnez **une agence** (nouvelle étape !)
4. Sélectionnez **Rapport Maintenance HT/BT**
5. Dans l'onglet "Général", **recherchez un code chantier**
6. Les champs sont **automatiquement remplis** :
   - Nom client
   - Numéro d'affaire
   - Adresse complète
   - Responsable
   - Emails destinataires

## 🎨 Nouveaux composants créés

1. **ChantierSearch** - Recherche et sélection de chantier
2. **Page admin** - Gestion agences et chantiers
3. **Étape sélection agence** - Entre entité et type document

## 📊 Flux complet

```
1. Sélection ENTITÉ (ALLEZ ENERGIES)
   ↓
2. Sélection AGENCE (Saint-Gilles, Nantes, etc.)
   ↓
3. Sélection TYPE DOCUMENT (Maintenance HT/BT)
   ↓
4. Recherche CODE CHANTIER (optionnel)
   ↓ (auto-rempli si trouvé)
5. Formulaire avec 8 onglets
   ↓
6. Génération PDF 11 pages
```

## ⚠️ Important

- Si une entité n'a **pas d'agences**, l'étape agence est sautée automatiquement
- La recherche de chantier est **optionnelle** - vous pouvez saisir manuellement
- Les emails des chantiers seront utilisés pour **l'envoi automatique** (Étape 3)

## 🔜 Prochaines étapes

**Étape 2** (à venir) :
- Liste des rapports (brouillons + générés)
- Templates vierges
- Recherche et filtres

**Étape 3** (à venir) :
- Envoi par email (un ou plusieurs destinataires)
- Auto-remplissage emails depuis chantier

## 🧪 Tester maintenant

1. ✅ Exécutez le SQL (`formia-schema-extension.sql`)
2. ✅ Ajoutez vos 12 agences ALLEZ ENERGIES dans `/formia/admin`
3. ✅ Ajoutez quelques chantiers de test
4. ✅ Créez un rapport en utilisant la recherche de chantier

---

**Étape 1 complète !** 🎉 Testez et revenez pour l'Étape 2.
