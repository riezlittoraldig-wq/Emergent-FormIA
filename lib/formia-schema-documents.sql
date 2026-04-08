-- FormIA - Phase 2B : Gestion des techniciens et rapports
-- Exécutez ce SQL dans Supabase SQL Editor

-- Table des documents/rapports générés
CREATE TABLE IF NOT EXISTS formia_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number VARCHAR(50) UNIQUE NOT NULL,
  entity_id UUID REFERENCES formia_entities(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES formia_agencies(id) ON DELETE SET NULL,
  document_type VARCHAR(50) DEFAULT 'maintenance_htbt',
  client_name VARCHAR(255),
  chantier_id UUID REFERENCES formia_chantiers(id) ON DELETE SET NULL,
  data_json JSONB NOT NULL,
  pdf_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'validated')),
  created_by UUID REFERENCES formia_user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table de liaison many-to-many : documents ↔ techniciens
CREATE TABLE IF NOT EXISTS formia_document_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES formia_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES formia_user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'intervenant' CHECK (role IN ('principal', 'intervenant')),
  temps_intervention DECIMAL(5,2), -- en heures (ex: 2.5 = 2h30)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_formia_documents_entity ON formia_documents(entity_id);
CREATE INDEX IF NOT EXISTS idx_formia_documents_agency ON formia_documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_formia_documents_created_by ON formia_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_formia_documents_status ON formia_documents(status);
CREATE INDEX IF NOT EXISTS idx_formia_documents_created_at ON formia_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_formia_document_technicians_document ON formia_document_technicians(document_id);
CREATE INDEX IF NOT EXISTS idx_formia_document_technicians_user ON formia_document_technicians(user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_formia_documents_updated_at
BEFORE UPDATE ON formia_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS pour formia_documents
ALTER TABLE formia_documents ENABLE ROW LEVEL SECURITY;

-- Policy : Super admins voient tous les documents
CREATE POLICY "Super admins can view all documents"
ON formia_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM formia_user_profiles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy : Admin agence voit les documents de son entité
CREATE POLICY "Admin agence can view entity documents"
ON formia_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM formia_user_profiles
    WHERE user_id = auth.uid() 
    AND role = 'admin_agence' 
    AND entity_id = formia_documents.entity_id
  )
);

-- Policy : Technicien voit les documents de son agence
CREATE POLICY "Technicien can view agency documents"
ON formia_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM formia_user_profiles
    WHERE user_id = auth.uid() 
    AND role = 'technicien' 
    AND agency_id = formia_documents.agency_id
  )
);

-- Policy : Technicien voit ses propres documents
CREATE POLICY "Technicien can view own documents"
ON formia_documents FOR SELECT
USING (created_by = auth.uid());

-- Policy : Utilisateurs peuvent créer des documents
CREATE POLICY "Users can create documents"
ON formia_documents FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy : Utilisateurs peuvent modifier leurs documents
CREATE POLICY "Users can update own documents"
ON formia_documents FOR UPDATE
USING (created_by = auth.uid());

-- RLS pour formia_document_technicians
ALTER TABLE formia_document_technicians ENABLE ROW LEVEL SECURITY;

-- Policy : Lecture selon accès au document
CREATE POLICY "Users can view document technicians"
ON formia_document_technicians FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM formia_documents
    WHERE formia_documents.id = formia_document_technicians.document_id
    -- L'utilisateur a accès au document (vérifié par les policies de formia_documents)
  )
);

-- Policy : Création/Modification selon accès au document
CREATE POLICY "Users can manage document technicians"
ON formia_document_technicians FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM formia_documents
    WHERE formia_documents.id = formia_document_technicians.document_id
    AND formia_documents.created_by = auth.uid()
  )
);

-- Vue pour faciliter les requêtes
CREATE OR REPLACE VIEW formia_documents_full AS
SELECT 
  d.*,
  e.name as entity_name,
  a.name as agency_name,
  a.code as agency_code,
  c.code_chantier,
  c.client_name as chantier_client_name,
  u.prenom as creator_prenom,
  u.nom as creator_nom,
  (
    SELECT json_agg(json_build_object(
      'user_id', dt.user_id,
      'prenom', up.prenom,
      'nom', up.nom,
      'role', dt.role,
      'temps_intervention', dt.temps_intervention
    ))
    FROM formia_document_technicians dt
    LEFT JOIN formia_user_profiles up ON dt.user_id = up.user_id
    WHERE dt.document_id = d.id
  ) as technicians
FROM formia_documents d
LEFT JOIN formia_entities e ON d.entity_id = e.id
LEFT JOIN formia_agencies a ON d.agency_id = a.id
LEFT JOIN formia_chantiers c ON d.chantier_id = c.id
LEFT JOIN formia_user_profiles u ON d.created_by = u.user_id;

-- Commentaires
COMMENT ON TABLE formia_documents IS 'Documents/Rapports générés par l''application';
COMMENT ON TABLE formia_document_technicians IS 'Liaison many-to-many entre documents et techniciens intervenants';
COMMENT ON COLUMN formia_document_technicians.temps_intervention IS 'Temps d''intervention en heures (ex: 2.5 = 2h30)';
