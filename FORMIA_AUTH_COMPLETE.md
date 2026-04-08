# FormIA - Phase 2A : Authentification & Permissions - TERMINÉE ✅

## 📋 **Vue d'ensemble**

L'authentification Supabase est maintenant intégrée dans FormIA avec un système de rôles et permissions.

---

## ⚠️ **ACTIONS REQUISES : Configuration Supabase**

### **Étape 1 : Exécuter le script SQL**

Allez sur : https://supabase.com/dashboard/project/cywwdjmzaytjreprgatf/editor

Exécutez le script complet disponible dans `/app/lib/formia-schema-auth.sql`

**OU** exécutez ce SQL :

```sql
-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS formia_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin_agence', 'technicien')),
  entity_id UUID REFERENCES formia_entities(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES formia_agencies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_user_id ON formia_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_entity ON formia_user_profiles(entity_id);
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_agency ON formia_user_profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_role ON formia_user_profiles(role);

-- RLS
ALTER TABLE formia_user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies (voir fichier complet pour toutes les policies)
```

### **Étape 2 : Créer votre premier utilisateur Super Admin**

#### **Option A : Via Supabase Dashboard**
1. Allez dans **Authentication** > **Users**
2. Cliquez sur **"Add user"**
3. Entrez :
   - Email : `admin@votredomaine.fr`
   - Password : Votre mot de passe sécurisé
   - User Metadata (JSON) :
   ```json
   {
     "prenom": "Admin",
     "nom": "FormIA",
     "role": "super_admin"
   }
   ```
4. Le trigger créera automatiquement le profil dans `formia_user_profiles`

#### **Option B : Via SQL**
```sql
-- Remplacez les valeurs par les vôtres
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@formia.com',
  crypt('VotreMotDePasse123!', gen_salt('bf')),
  NOW(),
  '{"prenom": "Admin", "nom": "FormIA", "role": "super_admin"}'::jsonb,
  NOW(),
  NOW()
);
```

---

## 🎯 **Fonctionnalités implémentées**

### **1. Authentification Supabase**
- ✅ Connexion avec email/password
- ✅ Session persistante
- ✅ Déconnexion
- ✅ Protection automatique des routes

### **2. Système de rôles**
- ✅ **Super Admin** : Accès total, gère toutes les entités
- ✅ **Admin Agence** : Accès à son entité uniquement
- ✅ **Technicien** : Accès à son agence uniquement

### **3. Interface utilisateur**
- ✅ Page de login (`/formia/login`)
- ✅ Header avec nom de l'utilisateur + rôle
- ✅ Bouton de déconnexion
- ✅ Redirection automatique si non connecté

### **4. Sécurité**
- ✅ Row Level Security (RLS) sur Supabase
- ✅ Protection côté client (ProtectedRoute)
- ✅ Protection côté serveur (policies Supabase)
- ✅ Tokens JWT gérés automatiquement

---

## 📂 **Fichiers créés**

### **Backend / Configuration**
- `/app/lib/formia-schema-auth.sql` - Schéma complet avec RLS policies
- `/app/lib/formia-auth-context.jsx` - Contexte React pour l'authentification

### **Components**
- `/app/components/formia/ProtectedRoute.jsx` - HOC pour protéger les routes

### **Pages**
- `/app/app/formia/login/page.js` - Page de connexion
- `/app/app/formia/layout.js` - Layout avec AuthProvider et header

---

## 🔐 **Utilisation dans le code**

### **Dans un composant**
```jsx
'use client'

import { useAuth } from '@/lib/formia-auth-context'

export default function MaPage() {
  const { user, profile, isSuperAdmin, isAdminAgence, isTechnicien, signOut } = useAuth()

  return (
    <div>
      <p>Bonjour {profile?.prenom} !</p>
      <p>Rôle : {profile?.role}</p>
      
      {isSuperAdmin && <p>Vous êtes super admin</p>}
      {isAdminAgence && <p>Votre entité : {profile.formia_entities?.name}</p>}
      {isTechnicien && <p>Votre agence : {profile.formia_agencies?.name}</p>}
      
      <button onClick={signOut}>Déconnexion</button>
    </div>
  )
}
```

### **Protéger une page manuellement**
```jsx
import { ProtectedRoute } from '@/components/formia/ProtectedRoute'

export default function PageProtegee() {
  return (
    <ProtectedRoute>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  )
}
```

---

## 🗂️ **Structure de la table `formia_user_profiles`**

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | ID unique du profil |
| `user_id` | UUID | Lien vers `auth.users` (Supabase Auth) |
| `prenom` | VARCHAR(100) | Prénom de l'utilisateur |
| `nom` | VARCHAR(100) | Nom de l'utilisateur |
| `phone` | VARCHAR(50) | Téléphone (optionnel) |
| `role` | VARCHAR(20) | 'super_admin', 'admin_agence', 'technicien' |
| `entity_id` | UUID | Lien vers `formia_entities` (pour admin_agence) |
| `agency_id` | UUID | Lien vers `formia_agencies` (pour technicien) |
| `avatar_url` | TEXT | URL de l'avatar (optionnel) |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

---

## 🔒 **Permissions (RLS Policies)**

### **Super Admin**
- ✅ Lecture de tous les profils
- ✅ Modification de tous les profils
- ✅ Création de nouveaux profils

### **Admin Agence**
- ✅ Lecture de son propre profil
- ✅ Lecture des profils de son entité (à implémenter si nécessaire)
- ✅ Modification de son propre profil

### **Technicien**
- ✅ Lecture de son propre profil
- ✅ Modification de son propre profil

---

## 🚀 **Prochaines étapes (Phase 2B)**

Maintenant que l'authentification est en place, nous pouvons passer à :

1. **Modifier le formulaire Maintenance HT/BT** pour ajouter :
   - Technicien principal (pré-rempli automatiquement)
   - Ajout de techniciens supplémentaires
   - Temps d'intervention par technicien

2. **Créer la table `formia_document_technicians`** :
   - Lien document ↔ technicien many-to-many
   - Temps d'intervention par technicien

3. **Mettre à jour le PDF** pour afficher :
   - Liste des techniciens
   - Temps d'intervention de chacun

4. **Interface Admin** :
   - Gestion des utilisateurs (créer, modifier, supprimer)
   - Assigner agence/entité aux utilisateurs

---

## ✅ **Tests à effectuer**

### **Après avoir exécuté le SQL et créé un utilisateur :**

1. **Tester la connexion** :
   - Allez sur `http://localhost:3000/formia/login`
   - Connectez-vous avec votre email/password

2. **Vérifier la redirection** :
   - Une fois connecté, vous devriez être redirigé vers `/formia`
   - Le header devrait afficher votre nom et rôle

3. **Tester la déconnexion** :
   - Cliquez sur "Déconnexion"
   - Vous devriez être redirigé vers `/formia/login`

4. **Vérifier la protection** :
   - Déconnectez-vous
   - Essayez d'accéder à `/formia/admin`
   - Vous devriez être automatiquement redirigé vers `/formia/login`

---

## 📞 **Support**

En cas de problème :
- Vérifiez que le SQL a bien été exécuté dans Supabase
- Vérifiez que les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont bien dans `.env`
- Vérifiez les logs du navigateur (F12 → Console)
- Vérifiez les logs Supabase (Dashboard → Logs → Auth)
