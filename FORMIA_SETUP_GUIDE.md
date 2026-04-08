# 🔑 Guide de Configuration Supabase - FormIA Licensing

## 🎯 Architecture : 2 Supabase différents

### 1️⃣ SUPABASE CENTRAL (RLD - VOUS)
**C'est VOTRE Supabase** - où vous gérez toutes les licences de vos clients

**Table à créer :**
- ✅ `formia_licenses` - Contient toutes les licences vendues

**Script à exécuter :**
```bash
/app/lib/formia-schema-licenses.sql
```

**Étapes :**
1. Connectez-vous à votre Supabase RLD
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de `formia-schema-licenses.sql`
4. Exécutez ▶️

**Variables d'environnement à configurer (.env) :**
```env
# Votre Supabase Central RLD
CENTRAL_SUPABASE_URL=https://votre-projet-rld.supabase.co
CENTRAL_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2️⃣ SUPABASE CLIENT (Chaque client)
**C'est le Supabase de CHAQUE CLIENT** - données isolées

**Tables à créer :**
- ✅ `formia_entities`
- ✅ `formia_agencies` (avec colonne `type`)
- ✅ `formia_chantiers`
- ✅ `formia_user_profiles`
- ✅ `formia_documents`
- ✅ `formia_document_technicians`

**Scripts à exécuter (dans l'ordre) :**
```bash
1. /app/lib/formia-schema.sql
2. /app/lib/formia-schema-agencies-update.sql
3. /app/lib/formia-schema-auth.sql
4. /app/lib/formia-schema-documents.sql
```

**⚠️ ATTENTION :** Chaque client exécute ces scripts dans **SON** Supabase, pas le vôtre !

---

## 🚀 Étapes de déploiement

### POUR VOUS (RLD)

#### Étape 1 : Créer votre Supabase Central
1. Allez sur https://supabase.com
2. Créez un projet "FormIA-Central-RLD" (ou similaire)
3. Copiez l'URL et l'Anon Key

#### Étape 2 : Créer la table des licences
1. Ouvrez SQL Editor
2. Exécutez `/app/lib/formia-schema-licenses.sql`
3. Vérifiez : `SELECT * FROM formia_licenses;`

#### Étape 3 : Configurer l'application
Ajoutez dans `/app/.env` :
```env
CENTRAL_SUPABASE_URL=https://xxxxx.supabase.co
CENTRAL_SUPABASE_ANON_KEY=eyJhbGci...
```

#### Étape 4 : Créer des licences
```sql
-- Exemple : Créer une licence pour un client
INSERT INTO formia_licenses (
  organization_name,
  contact_email,
  plan_type,
  max_users,
  expires_at
) VALUES (
  'Client Test SARL',
  'test@client.fr',
  'pro',
  10,
  NOW() + INTERVAL '1 year'
)
RETURNING license_key, organization_name, expires_at;
```

**Copiez le `license_key` généré et donnez-le au client !**

---

### POUR VOS CLIENTS

#### Étape 1 : Créer leur Supabase
1. Le client crée son propre projet Supabase
2. Il copie son URL et Anon Key

#### Étape 2 : Créer les tables
Le client exécute dans **son** SQL Editor :
1. `formia-schema.sql` (tables de base)
2. `formia-schema-agencies-update.sql` (ajout colonne type)
3. `formia-schema-auth.sql` (authentification + RLS)
4. `formia-schema-documents.sql` (documents + techniciens)

#### Étape 3 : Configurer FormIA
Le client démarre l'application → redirection `/setup`

Il saisit :
- ✅ **Clé de licence** (fournie par vous)
- ✅ **Supabase URL** (son projet)
- ✅ **Supabase Anon Key** (son projet)
- ✅ **SMTP** (optionnel)

#### Étape 4 : Utiliser l'application
Redirection vers `/formia/login` → Prêt !

---

## 🔧 Commandes SQL utiles

### Créer une licence
```sql
INSERT INTO formia_licenses (
  organization_name,
  contact_email,
  plan_type,
  max_users,
  expires_at
) VALUES (
  'Mon Client',
  'email@client.fr',
  'pro',
  5,
  '2026-12-31 23:59:59'
)
RETURNING license_key;
```

### Lister toutes les licences
```sql
SELECT 
  license_key,
  organization_name,
  plan_type,
  max_users,
  status,
  expires_at,
  last_verified_at
FROM formia_licenses
ORDER BY created_at DESC;
```

### Vérifier une licence
```sql
SELECT * FROM verify_formia_license('votre-uuid-ici');
```

### Suspendre une licence
```sql
UPDATE formia_licenses
SET status = 'suspended'
WHERE license_key = 'uuid-du-client';
```

### Renouveler une licence
```sql
UPDATE formia_licenses
SET 
  expires_at = NOW() + INTERVAL '1 year',
  status = 'active'
WHERE license_key = 'uuid-du-client';
```

---

## ✅ Checklist de configuration

### Votre Supabase Central (RLD)
- [ ] Projet Supabase créé
- [ ] Script `formia-schema-licenses.sql` exécuté
- [ ] Table `formia_licenses` visible
- [ ] Fonction `verify_formia_license` créée
- [ ] Variables `.env` configurées (CENTRAL_SUPABASE_URL/KEY)
- [ ] Au moins 1 licence de test créée

### Supabase du client de test
- [ ] Projet Supabase créé
- [ ] Script `formia-schema.sql` exécuté
- [ ] Script `formia-schema-agencies-update.sql` exécuté
- [ ] Script `formia-schema-auth.sql` exécuté
- [ ] Script `formia-schema-documents.sql` exécuté
- [ ] Toutes les tables visibles dans Table Editor

---

## 🐛 Dépannage

### "formia_licenses not found"
➡️ Vous cherchez dans le mauvais Supabase ! Vérifiez que vous êtes dans votre projet CENTRAL RLD.

### "Licence invalide"
➡️ Vérifiez que la fonction `verify_formia_license` existe :
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'verify_formia_license';
```

### "Configuration non trouvée"
➡️ Vérifiez `/app/.env` : les variables `CENTRAL_SUPABASE_URL` et `CENTRAL_SUPABASE_ANON_KEY` doivent pointer vers VOTRE Supabase central.

---

**Créé le** : 8 avril 2025  
**Auteur** : FormIA by RLD
