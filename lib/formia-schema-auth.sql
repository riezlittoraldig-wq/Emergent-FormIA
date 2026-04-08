-- FormIA - Authentification & Gestion des utilisateurs
-- Exécutez ce SQL dans Supabase SQL Editor

-- Table des profils utilisateurs (liée à Supabase Auth)
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

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_user_id ON formia_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_entity ON formia_user_profiles(entity_id);
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_agency ON formia_user_profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_formia_user_profiles_role ON formia_user_profiles(role);

-- Commentaires
COMMENT ON TABLE formia_user_profiles IS 'Profils utilisateurs avec rôles et rattachements';
COMMENT ON COLUMN formia_user_profiles.role IS 'super_admin (tout voir), admin_agence (son entité), technicien (son agence)';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_formia_user_profiles_updated_at
BEFORE UPDATE ON formia_user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - IMPORTANT pour la sécurité
ALTER TABLE formia_user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
ON formia_user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON formia_user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Policy : Super admins peuvent tout voir
CREATE POLICY "Super admins can view all profiles"
ON formia_user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM formia_user_profiles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy : Super admins peuvent tout modifier
CREATE POLICY "Super admins can update all profiles"
ON formia_user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM formia_user_profiles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy : Super admins peuvent créer des profils
CREATE POLICY "Super admins can insert profiles"
ON formia_user_profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM formia_user_profiles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.formia_user_profiles (user_id, prenom, nom, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', 'Prénom'),
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Nom'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'technicien')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Exemple : Créer un super admin (à adapter avec votre email)
/*
-- 1. Créer l'utilisateur dans Supabase Auth Dashboard ou via SQL :
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@formia.com',
  crypt('VotreMotDePasse123!', gen_salt('bf')),
  NOW(),
  '{"prenom": "Admin", "nom": "FormIA", "role": "super_admin"}'::jsonb
);

-- 2. Le trigger créera automatiquement le profil dans formia_user_profiles
*/

-- Vue pour faciliter les requêtes (optionnel)
CREATE OR REPLACE VIEW formia_users_full AS
SELECT 
  p.*,
  u.email,
  e.name as entity_name,
  a.name as agency_name,
  a.code as agency_code
FROM formia_user_profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
LEFT JOIN formia_entities e ON p.entity_id = e.id
LEFT JOIN formia_agencies a ON p.agency_id = a.id;
