# Configuration Supabase pour FormIA

## Étape 1: Créer les tables dans Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez le contenu du fichier `/app/lib/formia-schema.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** pour créer toutes les tables

## Étape 2: Créer le bucket de stockage

1. Dans le dashboard Supabase, allez dans **Storage**
2. Cliquez sur **New bucket**
3. Nom du bucket: `formia-assets`
4. Cochez **Public bucket** (pour accéder aux logos et photos)
5. Cliquez sur **Create bucket**

## Étape 3: Uploader le logo ALLEZ ENERGIES

1. Dans **Storage** > **formia-assets**
2. Créez un dossier `logos`
3. Uploadez le fichier logo (depuis les assets fournis)
4. Copiez l'URL publique du logo
5. Mettez à jour la table `formia_entities` avec l'URL du logo:

```sql
UPDATE formia_entities 
SET logo_url = 'https://cywwdjmzaytjreprgatf.supabase.co/storage/v1/object/public/formia-assets/logos/allez-energies-logo.png'
WHERE name = 'ALLEZ ENERGIES';
```

## Vérification

Vérifiez que les tables sont créées:
```sql
SELECT * FROM formia_entities;
SELECT * FROM formia_document_types;
```

Vous devriez voir:
- 1 entité: ALLEZ ENERGIES
- 1 type de document: Rapport de Maintenance HT/BT

## Structure créée

**Tables:**
- `formia_entities` - Entités (ALLEZ ENERGIES, etc.)
- `formia_document_types` - Types de documents
- `formia_templates` - Templates de formulaires
- `formia_documents` - Documents générés
- `formia_media` - Photos/médias

**Storage:**
- Bucket `formia-assets` avec dossiers:
  - `logos/` - Logos des entités
  - `photos/` - Photos des rapports

## Note importante

Le préfixe `formia_` est utilisé pour toutes les tables afin d'éviter les conflits avec d'autres applications du SaaS TaskIA.
