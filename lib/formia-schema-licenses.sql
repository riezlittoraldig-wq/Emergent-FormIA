-- FormIA - Système de Licences (À EXÉCUTER SUR VOTRE SUPABASE CENTRAL RLD)
-- Ce SQL doit être exécuté sur VOTRE Supabase à vous (RLD)
-- PAS sur le Supabase du client !

-- Table des licences pour gérer les clients
CREATE TABLE IF NOT EXISTS formia_licenses (
  license_key UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  
  -- Plan et limites
  plan_type VARCHAR(50) DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
  max_users INTEGER DEFAULT 1,
  max_agencies INTEGER DEFAULT 1,
  
  -- Fonctionnalités
  features JSONB DEFAULT '{
    "offline_mode": true,
    "email_notifications": true,
    "cloud_storage": false,
    "api_access": false,
    "custom_branding": false
  }'::jsonb,
  
  -- Dates et statut
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'cancelled')),
  
  -- Informations de déploiement
  deployment_url VARCHAR(500),
  supabase_project_id VARCHAR(100),
  
  -- Notes internes
  notes TEXT,
  
  -- Suivi
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_count INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_formia_licenses_status ON formia_licenses(status);
CREATE INDEX IF NOT EXISTS idx_formia_licenses_expires ON formia_licenses(expires_at);
CREATE INDEX IF NOT EXISTS idx_formia_licenses_email ON formia_licenses(contact_email);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_formia_licenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_formia_licenses_timestamp
BEFORE UPDATE ON formia_licenses
FOR EACH ROW
EXECUTE FUNCTION update_formia_licenses_updated_at();

-- Vue pour statistiques
CREATE OR REPLACE VIEW formia_licenses_stats AS
SELECT 
  status,
  COUNT(*) as count,
  SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as valid_count,
  SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired_count
FROM formia_licenses
GROUP BY status;

-- Commentaires
COMMENT ON TABLE formia_licenses IS 'Licences FormIA pour gérer les clients (Supabase central RLD uniquement)';
COMMENT ON COLUMN formia_licenses.license_key IS 'Clé UUID unique à fournir au client';
COMMENT ON COLUMN formia_licenses.max_users IS 'Nombre maximum d''utilisateurs autorisés';
COMMENT ON COLUMN formia_licenses.features IS 'Fonctionnalités activées pour ce client';

-- Fonction pour vérifier une licence (appelée par l'API)
CREATE OR REPLACE FUNCTION verify_formia_license(p_license_key UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  organization_name VARCHAR,
  plan_type VARCHAR,
  max_users INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR,
  features JSONB,
  message TEXT
) AS $$
DECLARE
  v_license RECORD;
BEGIN
  -- Récupérer la licence
  SELECT * INTO v_license
  FROM formia_licenses
  WHERE license_key = p_license_key;

  -- Licence introuvable
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false,
      NULL::VARCHAR,
      NULL::VARCHAR,
      NULL::INTEGER,
      NULL::TIMESTAMP WITH TIME ZONE,
      NULL::VARCHAR,
      NULL::JSONB,
      'Licence invalide ou introuvable'::TEXT;
    RETURN;
  END IF;

  -- Mettre à jour les statistiques de vérification
  UPDATE formia_licenses
  SET 
    last_verified_at = NOW(),
    verification_count = verification_count + 1
  WHERE license_key = p_license_key;

  -- Licence expirée
  IF v_license.expires_at < NOW() THEN
    RETURN QUERY SELECT 
      false,
      v_license.organization_name,
      v_license.plan_type,
      v_license.max_users,
      v_license.expires_at,
      'expired'::VARCHAR,
      v_license.features,
      'Licence expirée. Veuillez contacter RLD pour renouveler.'::TEXT;
    RETURN;
  END IF;

  -- Licence suspendue
  IF v_license.status = 'suspended' THEN
    RETURN QUERY SELECT 
      false,
      v_license.organization_name,
      v_license.plan_type,
      v_license.max_users,
      v_license.expires_at,
      v_license.status,
      v_license.features,
      'Licence suspendue. Contactez RLD.'::TEXT;
    RETURN;
  END IF;

  -- Licence valide
  RETURN QUERY SELECT 
    true,
    v_license.organization_name,
    v_license.plan_type,
    v_license.max_users,
    v_license.expires_at,
    v_license.status,
    v_license.features,
    'Licence valide'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Exemple de création de licence (à adapter)
/*
-- Créer une licence pour un client
INSERT INTO formia_licenses (
  organization_name,
  contact_email,
  contact_phone,
  plan_type,
  max_users,
  expires_at,
  deployment_url,
  notes
) VALUES (
  'Entreprise Dupont',
  'contact@dupont.fr',
  '0123456789',
  'pro',
  5,
  NOW() + INTERVAL '1 year',
  'https://formia-dupont.vercel.app',
  'Client premium - Installation le 08/04/2026'
);

-- Récupérer la clé de licence générée
SELECT license_key, organization_name, expires_at 
FROM formia_licenses 
WHERE organization_name = 'Entreprise Dupont';

-- Tester la vérification
SELECT * FROM verify_formia_license('VOTRE-LICENSE-KEY-UUID-ICI');
*/
