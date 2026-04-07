-- FormIA - Extension Multi-agences + Chantiers
-- Exécutez ce SQL dans Supabase SQL Editor APRÈS avoir exécuté formia-schema.sql

-- Table des agences (rattachées aux entités)
CREATE TABLE IF NOT EXISTS formia_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES formia_entities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  address TEXT,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  responsable VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des chantiers/affaires
CREATE TABLE IF NOT EXISTS formia_chantiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_chantier VARCHAR(100) NOT NULL UNIQUE,
  client_name VARCHAR(255) NOT NULL,
  address TEXT,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  responsable_affaire VARCHAR(255),
  emails TEXT[], -- Array d'emails pour envoi
  entity_id UUID REFERENCES formia_entities(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES formia_agencies(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter agency_id aux documents
ALTER TABLE formia_documents ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES formia_agencies(id) ON DELETE SET NULL;
ALTER TABLE formia_documents ADD COLUMN IF NOT EXISTS code_chantier VARCHAR(100);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_formia_agencies_entity ON formia_agencies(entity_id);
CREATE INDEX IF NOT EXISTS idx_formia_chantiers_code ON formia_chantiers(code_chantier);
CREATE INDEX IF NOT EXISTS idx_formia_chantiers_entity ON formia_chantiers(entity_id);
CREATE INDEX IF NOT EXISTS idx_formia_chantiers_agency ON formia_chantiers(agency_id);
CREATE INDEX IF NOT EXISTS idx_formia_documents_agency ON formia_documents(agency_id);

-- Données exemple pour ALLEZ ENERGIES
-- Agence principale
INSERT INTO formia_agencies (entity_id, name, code, address, postal_code, city, phone, email) 
SELECT 
  id,
  'Agence Saint-Gilles-Croix-de-Vie',
  'SGCV',
  '15 rue des Couvreurs',
  '85800',
  'SAINT GILLES CROIX DE VIE',
  '02.51.60.00.00',
  'maintenance.stgilles@allez.fr'
FROM formia_entities 
WHERE name = 'ALLEZ ENERGIES'
ON CONFLICT DO NOTHING;

-- Exemple de chantiers
-- Vous pouvez ajouter vos chantiers ici ou via l'interface admin
INSERT INTO formia_chantiers (code_chantier, client_name, address, postal_code, city, responsable_affaire, emails, entity_id) 
SELECT 
  'GX265947VEN',
  'Camping Bel Air',
  '6 Allée de la chevreuse',
  '85180',
  'Les sables d''olonne',
  'Justine Palette',
  ARRAY['justine.palette@example.com']::TEXT[],
  id
FROM formia_entities 
WHERE name = 'ALLEZ ENERGIES'
ON CONFLICT (code_chantier) DO NOTHING;

COMMENT ON TABLE formia_agencies IS 'Agences rattachées aux entités (ex: 12 agences ALLEZ ENERGIES)';
COMMENT ON TABLE formia_chantiers IS 'Base de données des chantiers/affaires avec codes, clients et responsables';
