# FormIA - Générateur de Formulaires Professionnels

Application web premium pour générer des formulaires et documents métier dynamiques en fonction de l'entité sélectionnée.

## 🎯 Fonctionnalités

- ✅ Sélection d'entité (ALLEZ ENERGIES, etc.)
- ✅ Sélection de type de document (Rapport Maintenance HT/BT, etc.)
- ✅ Formulaire multi-étapes avec validation
- ✅ Upload de photos (avant intervention, transformateur, cellules protection)
- ✅ Génération PDF professionnelle avec branding
- ✅ Export PDF avec mise en page premium
- ✅ Interface responsive et mobile-first
- ✅ Sauvegarde en brouillon

## 🏗️ Architecture

### Stack Technique
- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Database + Storage + Auth)
- **PDF:** @react-pdf/renderer
- **UI:** shadcn/ui components avec design premium

### Structure des données
- `formia_entities` - Entités (ALLEZ ENERGIES, etc.)
- `formia_document_types` - Types de documents
- `formia_templates` - Templates de formulaires
- `formia_documents` - Documents générés
- `formia_media` - Photos et médias

## 🚀 Installation et Configuration

### Étape 1: Installer les dépendances

Les dépendances Supabase et React-PDF sont déjà installées :
- `@supabase/supabase-js`
- `@react-pdf/renderer`

### Étape 2: Configurer Supabase

#### 2.1 Créer les tables

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez le contenu du fichier `/app/lib/formia-schema.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** pour créer toutes les tables

#### 2.2 Créer le bucket de stockage

1. Dans le dashboard Supabase, allez dans **Storage**
2. Cliquez sur **New bucket**
3. Nom du bucket: `formia-assets`
4. Cochez **Public bucket**
5. Cliquez sur **Create bucket**
6. Dans le bucket créé, créez deux dossiers:
   - `logos/`
   - `photos/`

#### 2.3 Uploader le logo ALLEZ ENERGIES

1. Dans **Storage** > **formia-assets** > **logos**
2. Uploadez le fichier logo fourni (renommez-le en `allez-energies-logo.png`)
3. Copiez l'URL publique du logo
4. Mettez à jour la table `formia_entities` avec l'URL du logo:

```sql
UPDATE formia_entities 
SET logo_url = 'https://cywwdjmzaytjreprgatf.supabase.co/storage/v1/object/public/formia-assets/logos/allez-energies-logo.png'
WHERE name = 'ALLEZ ENERGIES';
```

### Étape 3: Vérifier la configuration

Vérifiez que tout est bien configuré:

```sql
-- Vérifier les entités
SELECT * FROM formia_entities;

-- Vérifier les types de documents
SELECT * FROM formia_document_types;
```

Vous devriez voir:
- ✅ 1 entité: ALLEZ ENERGIES (avec logo_url)
- ✅ 1 type de document: Rapport de Maintenance HT/BT

## 📱 Utilisation

### Accéder à FormIA

Ouvrez votre navigateur et allez sur:
```
https://taskia-pdf-builder.preview.emergentagent.com/formia
```

### Flux utilisateur

1. **Sélection de l'entité**
   - L'application affiche toutes les entités disponibles
   - ALLEZ ENERGIES est pré-sélectionné

2. **Sélection du type de document**
   - Choisissez "Rapport de Maintenance HT/BT"

3. **Remplissage du formulaire**
   
   **Onglet 1: Informations générales**
   - Nom du client/site (ex: camping bel air)
   - N° d'affaire (ex: GX265947VEN)
   - Date
   - Intervenant (ex: Stéphane LAUNAY)
   - Contact sur site (nom, téléphone, email)
   - Adresse du site

   **Onglet 2: Photos avant intervention**
   - Ajoutez jusqu'à 4 photos de l'état avant intervention

   **Onglet 3: Transformateur**
   - Marque (ex: france transfo)
   - Puissance (ex: 630 kva)
   - Année (ex: 2008)
   - N° d'origine
   - Référence
   - Photo de la plaque signalétique

   **Onglet 4: Cellules protection**
   - Ajoutez autant de cellules que nécessaire
   - Pour chaque cellule:
     * Marque (ex: merlin)
     * Type (ex: IM)
     * Référence
     * Désignation
     * Observations
     * Photo

4. **Prévisualisation et export PDF**
   - Cliquez sur "Prévisualiser le PDF"
   - Le PDF est généré avec le design premium
   - Téléchargez le PDF final

## 🎨 Design

L'application utilise un design premium avec:
- **Couleur principale:** Rouge (#E63946) - couleur dominante ALLEZ ENERGIES
- **Typographie:** Polices système optimisées
- **Composants:** shadcn/ui avec customisation
- **Responsive:** Mobile-first, optimisé pour terrain

## 📄 Structure du PDF généré

Le PDF généré suit exactement le format du rapport fourni:

1. **Page de garde**
   - Logo ALLEZ ENERGIES
   - Coordonnées de l'agence
   - Titre: RAPPORT DE MAINTENANCE HT/BT
   - Numéro de rapport
   - Nom du client
   - Informations encadrées (N° affaire, date, intervenant, contact, adresse)

2. **Page photos avant intervention**
   - Titre de section
   - Grille 2x2 de photos avec bordures rouges

3. **Page transformateur**
   - Section rouge avec informations techniques
   - Photo de la plaque

4. **Page(s) cellules protection**
   - Sections répétitives pour chaque cellule
   - Photos intégrées

## 🔧 Développement

### Structure des fichiers

```
/app
├── app/
│   ├── formia/
│   │   └── page.js                    # Page principale FormIA
│   ├── api/
│   │   └── formia/
│   │       └── generate-pdf/
│   │           └── route.js           # API génération PDF
│   └── layout.js                      # Layout avec Toaster
├── components/
│   └── formia/
│       ├── MaintenanceHTBTForm.jsx    # Formulaire principal
│       ├── PhotoUpload.jsx            # Upload photos
│       ├── TransformatorSection.jsx   # Section transformateur
│       ├── CelluleProtectionSection.jsx # Cellules protection
│       └── PDFPreview.jsx             # Prévisualisation PDF
├── lib/
│   ├── formia-supabase.js             # Client Supabase
│   ├── formia-pdf.jsx                 # Template PDF
│   └── formia-schema.sql              # Schéma base de données
└── .env                               # Variables d'environnement
```

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://cywwdjmzaytjreprgatf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BASE_URL=https://taskia-pdf-builder.preview.emergentagent.com
```

## 🚀 Prochaines étapes

Pour développer FormIA davantage, vous pouvez ajouter:

1. **Interface Admin**
   - Gestion des entités (CRUD)
   - Gestion des templates
   - Création de nouveaux types de documents

2. **Authentification**
   - Connexion utilisateur avec Supabase Auth
   - Rôles admin/utilisateur
   - Historique des documents par utilisateur

3. **Templates dynamiques**
   - Créateur de templates visuel
   - Logique conditionnelle avancée
   - Champs personnalisables

4. **Fonctionnalités avancées**
   - Signatures électroniques
   - Envoi par email
   - Stockage des PDF générés
   - Recherche et filtres

## 📝 Notes importantes

- ⚠️ Toutes les tables utilisent le préfixe `formia_` pour éviter les conflits avec d'autres applications du SaaS TaskIA
- ⚠️ Le bucket Supabase `formia-assets` doit être public pour que les images soient accessibles dans les PDF
- ⚠️ Les photos ne sont pas encore sauvegardées dans Supabase Storage (elles restent en mémoire). Pour la production, implémentez l'upload dans Storage avant la génération du PDF

## 🐛 Dépannage

### Les tables ne se créent pas
- Vérifiez que vous êtes bien connecté au bon projet Supabase
- Vérifiez que vous avez les permissions nécessaires

### Le logo ne s'affiche pas
- Vérifiez que le bucket `formia-assets` est public
- Vérifiez l'URL du logo dans la table `formia_entities`
- Vérifiez que le fichier existe dans Storage > formia-assets > logos

### Les photos ne s'affichent pas dans le PDF
- Les photos doivent être au format JPEG ou PNG
- La taille des fichiers ne doit pas être trop importante (< 5MB recommandé)

### Erreur CORS
- Vérifiez que CORS_ORIGINS=* dans le fichier .env
- Redémarrez le serveur Next.js

## 📞 Support

Pour toute question sur FormIA, référez-vous à:
- Le code source dans `/app/components/formia/`
- Le schéma SQL dans `/app/lib/formia-schema.sql`
- La documentation Supabase: https://supabase.com/docs

---

**FormIA** - Générateur de formulaires professionnels pour TaskIA
Développé avec Next.js, Supabase, et @react-pdf/renderer
