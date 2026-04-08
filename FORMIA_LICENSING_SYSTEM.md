# 🔐 Système de Licensing FormIA - Documentation Complète

## Vue d'ensemble

Le système de licensing de FormIA permet aux clients d'**auto-héberger** l'application tout en validant leur licence contre votre Supabase central. Chaque instance client possède sa propre base de données Supabase mais doit avoir une licence valide fournie par RLD.

---

## 📦 Architecture

### Composants principaux

1. **Supabase Central (RLD)** - Base de données maître contenant toutes les licences
2. **Instance Client** - Application Next.js auto-hébergée
3. **Supabase Client** - Base de données propre au client
4. **Fichier de configuration** - `/app/config/client.json` (stocke la config locale)

### Flux d'activation

```
Client démarre FormIA
    ↓
ConfigGuard vérifie client.json
    ↓ (manquant)
Redirection vers /setup
    ↓
Étape 1: Saisie clé de licence
    ↓
Validation via /api/verify-license (appel au Supabase Central RLD)
    ↓ (valide)
Étape 2: Configuration Supabase client
    ↓
Étape 3: Configuration SMTP (optionnel)
    ↓
Sauvegarde dans /config/client.json
    ↓
Redirection vers /formia/login
```

---

## 🗂️ Fichiers créés

### 1. `/app/app/setup/page.js`
**Interface utilisateur multi-étapes pour la configuration initiale**

- **Étape 1** : Activation de la licence
  - Saisie de la clé de licence UUID
  - Vérification en temps réel via l'API `/api/verify-license`
  - Affichage des infos de licence (organisation, plan, max users, expiration)

- **Étape 2** : Configuration Supabase
  - URL du projet Supabase du client
  - Anon Key du projet Supabase
  - Test de connexion en direct
  - Saisie du nom de l'organisation

- **Étape 3** : Configuration Email (optionnel)
  - Activation on/off
  - Serveur SMTP (host, port)
  - Credentials (user, password)
  - Email de la secrétaire (reçoit copie de tous les rapports)

### 2. `/app/app/api/config/route.js`
**API pour gérer la configuration client**

- **GET** `/api/config`
  - Lit `client.json` et retourne la config (sans données sensibles)
  - Retourne 404 si non configuré

- **POST** `/api/config`
  - Sauvegarde la configuration complète
  - Valide les champs requis (licence, Supabase URL/Key)
  - Crée `/config/client.json`

- **DELETE** `/api/config`
  - Supprime `client.json` (pour réinitialisation)

### 3. `/app/app/api/verify-license/route.js`
**API de vérification de licence** (déjà existant, mis à jour)

- **POST** `/api/verify-license`
  - Vérifie une clé de licence contre le Supabase Central RLD
  - Appelle la fonction RPC `verify_formia_license`
  - Retourne les infos de licence si valide

- **GET** `/api/verify-license`
  - Vérifie la licence actuelle (depuis `client.json`)
  - Utilisé par `ConfigGuard` pour protéger les routes

### 4. `/app/components/formia/ConfigGuard.jsx`
**Composant de protection des routes**

- Vérifie au chargement si l'application est configurée
- Redirige vers `/setup` si `client.json` manquant ou licence invalide
- Affiche un loader pendant la vérification
- Protège toutes les routes `/formia/*`

### 5. `/app/lib/formia-client-config.js`
**Utilitaires pour charger la configuration dynamiquement**

Fonctions exportées :
- `loadClientConfig()` - Charge `client.json`
- `isConfigured()` - Vérifie si configuré
- `getSupabaseCredentials()` - Retourne URL + Anon Key
- `getSmtpConfig()` - Retourne config SMTP
- `getEmailConfig()` - Retourne emails (secrétaire, etc.)
- `getOrganizationName()` - Retourne le nom de l'organisation
- `getLicenseInfo()` - Retourne les infos de licence

### 6. Fichiers mis à jour

- `/app/app/formia/layout.js` - Ajout du `ConfigGuard`
- `/app/app/api/formia/generate-pdf/route.js` - Utilise config dynamique pour Supabase et emails
- `/app/lib/formia-email.js` - Utilise config SMTP dynamique

---

## 🗄️ Structure de `client.json`

```json
{
  "configured": true,
  "license": {
    "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "organization": "Mon Entreprise SARL",
    "plan": "standard",
    "maxUsers": 10,
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "lastVerified": "2025-04-08T21:00:00.000Z"
  },
  "supabase": {
    "url": "https://xxxxxxxxx.supabase.co",
    "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "smtp": {
    "enabled": true,
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "noreply@monentreprise.fr",
    "password": "motdepasse_app"
  },
  "branding": {
    "organizationName": "Mon Entreprise SARL",
    "logo": "",
    "primaryColor": "#dc2626"
  },
  "emails": {
    "secretaire": "secretaire@monentreprise.fr",
    "notificationsFrom": "noreply@monentreprise.fr"
  },
  "createdAt": "2025-04-08T20:00:00.000Z",
  "updatedAt": "2025-04-08T21:00:00.000Z"
}
```

---

## 🔧 Configuration Supabase Central (RLD)

### Table `formia_licenses`

Vous devez créer cette table dans **votre Supabase central** (pas celui du client) :

```sql
-- Exécuter ce script dans VOTRE Supabase central
CREATE TABLE IF NOT EXISTS formia_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  plan_type TEXT NOT NULL DEFAULT 'standard', -- 'starter', 'standard', 'premium'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'expired'
  max_users INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  notes TEXT
);

-- Index pour recherche rapide par clé
CREATE INDEX idx_formia_licenses_key ON formia_licenses(license_key);
CREATE INDEX idx_formia_licenses_status ON formia_licenses(status);

-- Fonction RPC pour vérifier une licence
CREATE OR REPLACE FUNCTION verify_formia_license(p_license_key UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  organization_name TEXT,
  plan_type TEXT,
  max_users INTEGER,
  expires_at TIMESTAMPTZ,
  status TEXT,
  features JSONB,
  message TEXT
) AS $$
BEGIN
  -- Mettre à jour last_verified_at
  UPDATE formia_licenses
  SET last_verified_at = NOW()
  WHERE license_key = p_license_key;

  RETURN QUERY
  SELECT
    CASE
      WHEN l.status = 'active' AND (l.expires_at IS NULL OR l.expires_at > NOW())
        THEN TRUE
      ELSE FALSE
    END AS is_valid,
    l.organization_name,
    l.plan_type,
    l.max_users,
    l.expires_at,
    l.status,
    l.features,
    CASE
      WHEN l.status = 'active' AND (l.expires_at IS NULL OR l.expires_at > NOW())
        THEN 'Licence valide'
      WHEN l.status = 'expired' OR (l.expires_at IS NOT NULL AND l.expires_at <= NOW())
        THEN 'Licence expirée'
      WHEN l.status = 'suspended'
        THEN 'Licence suspendue'
      ELSE 'Licence invalide'
    END AS message
  FROM formia_licenses l
  WHERE l.license_key = p_license_key;
END;
$$ LANGUAGE plpgsql;
```

### Variables d'environnement (RLD)

Dans votre fichier `.env` (Supabase Central RLD) :

```env
# Supabase Central RLD (pour vérifier les licences)
CENTRAL_SUPABASE_URL=https://votre-projet-central.supabase.co
CENTRAL_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Utilisation

### Pour RLD (Vendeur de licences)

1. **Créer une nouvelle licence** dans votre Supabase Central :

```sql
INSERT INTO formia_licenses (
  organization_name,
  contact_email,
  plan_type,
  max_users,
  expires_at
) VALUES (
  'Client ABC SARL',
  'contact@clientabc.fr',
  'standard',
  10,
  '2026-12-31 23:59:59'
)
RETURNING license_key;
```

2. **Copier la `license_key`** générée et la fournir au client

### Pour le Client (Auto-hébergement)

1. **Déployer** l'application Next.js FormIA sur leur serveur
2. **Créer** leur propre projet Supabase et exécuter les scripts SQL :
   - `/app/lib/formia-schema.sql`
   - `/app/lib/formia-schema-agencies-update.sql`
   - `/app/lib/formia-schema-auth.sql`
   - `/app/lib/formia-schema-documents.sql`

3. **Accéder** à l'application → redirection automatique vers `/setup`

4. **Remplir le formulaire de configuration** :
   - Étape 1 : Clé de licence fournie par RLD
   - Étape 2 : URL et Anon Key de leur Supabase
   - Étape 3 : Configuration SMTP (optionnel)

5. **Cliquer sur "Terminer la configuration"**

6. **Redirection** vers `/formia/login` → Prêt à utiliser !

---

## ✅ Sécurité

### Données sensibles

- **`client.json`** contient des clés sensibles (Supabase Anon Key, SMTP Password)
- **Ajouté au `.gitignore`** automatiquement
- **Non exposé** via l'API GET `/api/config` (filtre les données sensibles)

### Protection des routes

- **ConfigGuard** vérifie la configuration à chaque chargement de `/formia/*`
- **Redirection automatique** vers `/setup` si non configuré ou licence invalide
- **Pas de middleware Edge** (pour éviter les problèmes de compatibilité fs/path)

---

## 🐛 Dépannage

### L'application redirige en boucle vers `/setup`

**Cause** : `client.json` manquant ou mal formé

**Solution** :
```bash
# Vérifier si le fichier existe
cat /app/config/client.json

# Si vide ou corrompu, supprimer et refaire le setup
rm /app/config/client.json
```

### Erreur "Licence invalide"

**Cause** : Clé de licence incorrecte ou expirée

**Solution** :
1. Vérifier dans le Supabase Central RLD :
```sql
SELECT * FROM formia_licenses WHERE license_key = 'votre-cle-ici';
```
2. Vérifier le statut (`active` ?) et la date d'expiration

### Erreur "Configuration Supabase invalide"

**Cause** : URL ou Anon Key incorrecte

**Solution** :
- Vérifier dans Supabase → Project Settings → API
- Copier l'URL complète : `https://xxxxx.supabase.co`
- Copier l'Anon Key (clé publique)

---

## 🔄 Réinitialisation

Pour réinitialiser complètement la configuration :

```bash
# Méthode 1 : Via l'API
curl -X DELETE http://localhost:3000/api/config

# Méthode 2 : Manuellement
rm /app/config/client.json
```

L'application redirigera automatiquement vers `/setup` au prochain chargement.

---

## 📝 Notes importantes

1. **Chaque client a son propre Supabase** - Les données sont isolées
2. **La licence est vérifiée uniquement au setup** - Pas de vérification continue (à améliorer dans v2)
3. **SMTP est optionnel** - Les PDFs sont générés même sans email
4. **Variables d'environnement en fallback** - Si `client.json` manque, l'app utilise `.env`

---

## 🚧 Améliorations futures (v2)

- [ ] Vérification périodique de la licence (cron job)
- [ ] Interface admin pour gérer les licences (dashboard RLD)
- [ ] Renouvellement automatique de licence
- [ ] Webhook de notification d'expiration
- [ ] Support multi-tenant (un seul Supabase, plusieurs organisations)
- [ ] Licence basée sur le nombre de documents générés
- [ ] Télémétrie anonyme (nombre d'utilisateurs, de rapports, etc.)

---

**Créé le** : 8 avril 2025  
**Version** : 1.0  
**Auteur** : FormIA by RLD
