# FormIA - Étape 2A COMPLÈTE ✅

## 🎉 Import Excel agences et chantiers fonctionnel !

### 🎯 Fonctionnalités implémentées

**1. Import Excel pour Agences** ✅
- Bouton "Télécharger le template" - génère automatiquement un fichier Excel
- Upload fichier Excel (.xlsx, .xls)
- Preview des 5 premières lignes
- Validation des colonnes requises
- Import en masse dans Supabase
- Colonnes supportées :
  * **name** (obligatoire) - Nom de l'agence
  * code - Code court
  * address - Adresse
  * postal_code - Code postal
  * city - Ville
  * phone - Téléphone
  * email - Email

**2. Import Excel pour Chantiers** ✅
- Même fonctionnement que les agences
- Template Excel téléchargeable avec exemple
- Gestion spéciale du champ `emails` (conversion virgules → array PostgreSQL)
- Colonnes supportées :
  * **code_chantier** (obligatoire) - Code unique
  * **client_name** (obligatoire) - Nom du client
  * address - Adresse
  * postal_code - Code postal
  * city - Ville
  * responsable_affaire - Responsable
  * emails - Emails séparés par virgule (ex: "email1@test.fr, email2@test.fr")

**3. Composant générique réutilisable** ✅
- `ImportExcel.jsx` - Peut être utilisé pour n'importe quel type de données
- Configuration via props (colonnes, validation, callback)
- Gestion d'erreurs détaillée
- UI premium avec preview

### 🚀 Utilisation

#### A. Importer des agences en masse

1. Allez sur https://taskia-pdf-builder.preview.emergentagent.com/formia/admin
2. Sélectionnez l'entité (ex: ALLEZ ENERGIES)
3. Onglet **Agences**
4. Section "Import Excel - Agences"
5. Cliquez **"Télécharger le template"**
   - Un fichier `template_agences.xlsx` est généré
   - Contient 2 lignes d'exemple
6. **Remplissez le fichier Excel** avec vos agences
   - Respectez les noms de colonnes (name, code, address, etc.)
   - La colonne `name` est obligatoire
7. **Uploadez le fichier** (glisser-déposer ou clic)
8. **Preview** - vérifiez que les données sont correctes
9. Cliquez **"Importer les données"**
10. ✅ Toutes les agences sont créées dans Supabase !

#### B. Importer des chantiers en masse

Même processus, onglet **Chantiers** :

1. Téléchargez `template_chantiers.xlsx`
2. Remplissez avec vos chantiers
3. **Important :** Pour les emails, séparez par virgule
   - Exemple : `contact1@mail.fr, contact2@mail.fr`
4. Uploadez et importez

### 📋 Templates Excel

**Template Agences - Colonnes:**
```
name | code | address | postal_code | city | phone | email
Agence Saint-Gilles | SGCV | 15 rue des Couvreurs | 85800 | SAINT GILLES CROIX DE VIE | 02.51.60.00.00 | stgilles@allez.fr
Agence Nantes | NAN | 10 rue de la Loire | 44000 | NANTES | 02.40.00.00.00 | nantes@allez.fr
```

**Template Chantiers - Colonnes:**
```
code_chantier | client_name | address | postal_code | city | responsable_affaire | emails
GX265947VEN | Camping Bel Air | 6 Allée de la chevreuse | 85180 | Les sables d'olonne | Justine Palette | justine.palette@example.com
CH202501 | Hôtel Les Sables | 12 avenue de la mer | 85100 | Les Sables-d'Olonne | Pierre Martin | p.martin@hotel.fr, contact@hotel.fr
```

### ⚠️ Gestion des erreurs

**Si une ligne échoue :**
- L'import continue pour les autres lignes
- Un message indique le nombre de lignes en erreur
- Vérifiez la console pour les détails

**Erreurs courantes :**
- Code chantier en doublon (UNIQUE constraint)
- Colonnes manquantes ou mal nommées
- Format email invalide

### 🎨 Interface

**Zones d'import visibles dans chaque onglet :**
- Carte bleue avec infos colonnes requises
- Zone d'upload (drag & drop)
- Tableau de preview (5 premières lignes)
- Validation en temps réel
- Bouton "Importer" vert

### 📊 Exemple d'utilisation réelle

**Pour créer les 12 agences ALLEZ ENERGIES :**

1. Créez un fichier Excel avec 12 lignes
2. Colonne `name` : 
   - Agence Saint-Gilles-Croix-de-Vie
   - Agence La Roche-sur-Yon
   - Agence Nantes
   - ... (9 autres)
3. Remplissez adresses, téléphones, emails
4. Import en 1 clic → **12 agences créées en 5 secondes !**

Au lieu de créer manuellement 12 fois via le formulaire.

### 🔧 Technique

**Bibliothèque utilisée :** `xlsx` (SheetJS)
- Parsing côté client (pas d'upload vers serveur)
- Conversion JSON automatique
- Génération de template dynamique

**Format supporté :** `.xlsx`, `.xls` (Excel)

**Taille recommandée :** < 1000 lignes (au-delà, prévoir pagination)

### ✅ Tests effectués

- [x] Téléchargement template agences
- [x] Téléchargement template chantiers
- [x] Upload fichier Excel
- [x] Preview des données
- [x] Validation colonnes manquantes
- [x] Import agences dans Supabase
- [x] Import chantiers dans Supabase
- [x] Gestion erreurs (doublons, etc.)
- [x] Conversion emails string → array PostgreSQL

### 🎯 État Étape 2A

**TERMINÉE à 100% ✅**

- [x] Gestion entités (CRUD)
- [x] Upload logo par entité
- [x] Composant Import Excel générique
- [x] Import Excel agences (intégré + testé)
- [x] Import Excel chantiers (intégré + testé)
- [x] Templates Excel téléchargeables (auto-générés)

### ⏭️ Prochaines étapes

**Étape 2B : Authentification + Permissions** (1h)
- Supabase Auth
- Connexion utilisateur
- Rôles (Admin groupe, Admin entité, User agence)
- Isolation des données par entité
- Système de licences

**Étape Offline : Mode hors ligne** (2-3h)
- Stockage local (IndexedDB)
- Détection online/offline
- Queue de synchronisation
- Signature électronique
- Sync automatique au retour de connexion

**Étape 2C : Nouveaux modèles** (1h)
- Bon d'intervention
- Fiche d'auto-contrôle
- Templates personnalisables

---

**Étape 2A complète !** 🎉  
**Documentation :** `/app/FORMIA_ETAPE2A.md`  
**Testez l'import Excel sur :** https://taskia-pdf-builder.preview.emergentagent.com/formia/admin
