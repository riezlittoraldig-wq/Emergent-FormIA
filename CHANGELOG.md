# Changelog - FormIA

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [0.9.0] - 2026-04-08

### 🎉 Ajouté

#### Phase 1 : Agences & Centres de travaux simplifiés
- Structure unifiée pour gérer agences et centres de travaux dans une seule table
- Champ `type` (agence/centre) et `parent_agency_id` dans `formia_agencies`
- Import Excel avec colonnes : Entité / Code ERP / Type / Code agence parente / Adresse / Téléphone / Email
- Formulaire CRUD avec sélection type et agence parente
- Badges visuels pour distinguer Agences et Centres
- SQL : `/app/lib/formia-schema-agencies-update.sql`
- Documentation : `/app/FORMIA_AGENCES_SIMPLIFIEES.md`

#### Phase 2A : Authentification & Permissions
- Page de login `/formia/login` avec design professionnel
- Context React `AuthContext` avec hooks `useAuth()`
- Composant `ProtectedRoute` pour protection automatique des routes
- Layout FormIA avec header authentifié (nom + rôle + déconnexion)
- Système de rôles : Super Admin, Admin Agence, Technicien
- Table `formia_user_profiles` liée à Supabase Auth
- Row Level Security (RLS) avec policies par rôle
- Trigger automatique de création de profil
- Vue `formia_users_full` pour requêtes facilitées
- SQL : `/app/lib/formia-schema-auth.sql`
- Documentation : `/app/FORMIA_AUTH_COMPLETE.md`

#### Phase 2B : Gestion des techniciens et rapports (90%)
- Table `formia_documents` pour stocker les rapports générés
- Table `formia_document_technicians` (many-to-many documents ↔ techniciens)
- RLS policies sur les documents par rôle
- Vue `formia_documents_full` avec agrégation des techniciens
- Onglet "Utilisateurs" dans `/formia/admin` avec CRUD profils
- Badges de rôles (Super Admin bleu, Admin Agence vert, Technicien jaune)
- Composant `TechniciensSection` pour gérer les intervenants
- Technicien principal pré-rempli automatiquement (utilisateur connecté)
- Ajout de techniciens supplémentaires avec dropdown
- Temps d'intervention par technicien (en heures)
- Calcul automatique du temps total d'intervention
- Nouvel onglet "Techniciens" dans le formulaire (après "Général")
- Section "TECHNICIENS INTERVENANTS" dans le PDF (page 1)
- Affichage technicien principal + intervenants avec temps
- Design professionnel avec bordure bleue et badges
- SQL : `/app/lib/formia-schema-documents.sql`

### 🔧 Modifié

- `/app/app/formia/admin/page.js` : Ajout onglet Utilisateurs + modification onglet Agences
- `/app/components/formia/MaintenanceHTBTForm.jsx` : Intégration useAuth + onglet Techniciens
- `/app/lib/formia-pdf.jsx` : Ajout section techniciens avec styles
- `/app/app/formia/layout.js` : Nouveau layout avec AuthProvider
- Import Excel pour agences : support du nouveau format avec type et parent

### 📚 Documentation

- Ajout `/app/PROGRESS.md` : État d'avancement détaillé du projet
- Ajout `/app/CHANGELOG.md` : Ce fichier
- Ajout `/app/FORMIA_AGENCES_SIMPLIFIEES.md`
- Ajout `/app/FORMIA_AUTH_COMPLETE.md`

### ⚠️ À faire (Priorité haute)

- Sauvegarde des documents en base après génération PDF
- Upload PDF sur Supabase Storage
- Envoi email automatique (responsable affaire + secrétaire)
- Upload cloud/serveur entreprise (optionnel)

### 🐛 Problèmes connus

- Contrôles vides dans le PDF généré (sections Accessoires, Disjoncteur BT, etc.)
- À investiguer et corriger dans une prochaine version

---

## [0.8.0] - 2026-04-07 (Session précédente)

### Ajouté

- MVP initial avec formulaire 8 étapes
- Génération PDF 11 pages avec @react-pdf/renderer
- Admin dashboard avec gestion Entités, Agences, Chantiers
- Import Excel pour Agences et Chantiers
- Recherche de chantiers avec autocomplétion
- Upload photos (avant/après intervention)
- Tables de contrôles (5 sections)
- Intégration Supabase (Database + Storage)
- Design avec Shadcn UI + Tailwind CSS

### Configuration

- Setup Next.js App Router
- Supabase client configuré
- Storage bucket `formia-assets` créé
- RLS désactivé temporairement sur Storage

---

## Versions à venir

### [1.0.0] - Mode hors ligne (Phase 2C)
- Dexie.js pour stockage local
- Service Worker PWA
- Synchronisation automatique
- Canvas signature électronique

### [1.1.0] - Système de licence
- Page setup initiale
- Validation licence centralisée
- Blocage si licence expirée
- Page paramètres

### [1.2.0] - Améliorations
- Correction problème contrôles PDF
- Envoi email automatique
- Upload cloud configurable
- Tests end-to-end complets
