-- 🎫 Script pour créer une licence de TEST FormIA
-- À exécuter dans le SQL Editor de votre Supabase

-- Créer une licence de test valide pour 1 an
INSERT INTO formia_licenses (
  organization_name,
  contact_email,
  contact_phone,
  plan_type,
  max_users,
  expires_at,
  deployment_url,
  notes,
  features
) VALUES (
  'RLD - Licence de Test',
  'test@rld.fr',
  '0600000000',
  'pro',
  10,
  NOW() + INTERVAL '1 year',
  'https://taskia-pdf-builder.preview.emergentagent.com',
  'Licence de test pour développement et démo',
  '{
    "offline_mode": true,
    "email_notifications": true,
    "cloud_storage": true,
    "api_access": true,
    "custom_branding": true
  }'::jsonb
)
RETURNING 
  license_key,
  organization_name,
  plan_type,
  max_users,
  expires_at,
  status;

-- Une fois exécuté, COPIEZ la clé license_key générée !
-- Vous en aurez besoin pour tester le formulaire /setup
