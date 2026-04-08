-- FormIA - Extension Centres de Travaux
-- Exécutez ce SQL dans Supabase SQL Editor

-- Table des centres de travaux (rattachés aux agences)
CREATE TABLE IF NOT EXISTS formia_centres_travaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES formia_agencies(id) ON DELETE CASCADE,
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

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_formia_centres_agency ON formia_centres_travaux(agency_id);

-- Commentaire
COMMENT ON TABLE formia_centres_travaux IS 'Centres de travaux rattachés aux agences (surtout ALLEZ ENERGIES)';

-- Exemple : Créer des centres de travaux pour une agence
-- (Remplacez {agency_id} par l'ID de votre agence)
/*
INSERT INTO formia_centres_travaux (agency_id, name, code, address, postal_code, city, phone) VALUES
  ('{agency_id}', 'Centre Les Sables d''Olonne', 'CT-LSO', '10 rue du Port', '85100', 'Les Sables d''Olonne', '02.51.32.00.00'),
  ('{agency_id}', 'Centre Challans', 'CT-CHA', '5 avenue de la Gare', '85300', 'Challans', '02.51.68.00.00');
*/
