-- ============================================================
-- FormIA — Configuration Cloud Upload
-- À exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS formia_cloud_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID REFERENCES formia_entities(id) ON DELETE CASCADE,

  -- Google Drive
  drive_enabled BOOLEAN DEFAULT false,
  drive_service_account_email TEXT,     -- email du service account Google
  drive_private_key TEXT,               -- clé privée (PEM)
  drive_folder_id TEXT,                 -- ID du dossier Drive cible

  -- FTP / SFTP
  ftp_enabled BOOLEAN DEFAULT false,
  ftp_host TEXT,
  ftp_port INTEGER DEFAULT 21,
  ftp_user TEXT,
  ftp_password TEXT,
  ftp_path TEXT DEFAULT '/formia/',      -- dossier distant
  ftp_secure BOOLEAN DEFAULT false,      -- true = SFTP

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index unique : une config par entité
CREATE UNIQUE INDEX IF NOT EXISTS formia_cloud_config_entity_idx
  ON formia_cloud_config(entity_id);

-- RLS
ALTER TABLE formia_cloud_config ENABLE ROW LEVEL SECURITY;

-- Super admin voit tout
CREATE POLICY "super_admin_cloud_config" ON formia_cloud_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM formia_user_profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Admin agence voit la config de son entité
CREATE POLICY "admin_agence_cloud_config" ON formia_cloud_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM formia_user_profiles p
      JOIN formia_agencies a ON p.agency_id = a.id
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin_agence'
        AND a.entity_id = formia_cloud_config.entity_id
    )
  );
