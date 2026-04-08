-- FormIA - Mise à jour de la table Agences
-- Ajout du support pour les Centres de travaux
-- Exécutez ce SQL dans Supabase SQL Editor

-- Ajouter le champ 'type' pour différencier Agence et Centre de travaux
ALTER TABLE formia_agencies 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'agence' CHECK (type IN ('agence', 'centre'));

-- Ajouter le champ 'parent_agency_id' pour lier un centre à son agence principale
ALTER TABLE formia_agencies 
ADD COLUMN IF NOT EXISTS parent_agency_id UUID REFERENCES formia_agencies(id) ON DELETE SET NULL;

-- Index pour performance sur parent_agency_id
CREATE INDEX IF NOT EXISTS idx_formia_agencies_parent ON formia_agencies(parent_agency_id);

-- Mettre à jour toutes les agences existantes en tant que type 'agence' (par défaut)
UPDATE formia_agencies SET type = 'agence' WHERE type IS NULL;

-- Commentaire
COMMENT ON COLUMN formia_agencies.type IS 'Type: agence (principale) ou centre (de travaux)';
COMMENT ON COLUMN formia_agencies.parent_agency_id IS 'Agence principale de rattachement (pour les centres de travaux)';

-- Exemple : Créer un centre de travaux rattaché à une agence
/*
-- 1. Trouver l'ID de l'agence principale (ex: Saint-Gilles)
SELECT id, name, code FROM formia_agencies WHERE code = 'SGCV';

-- 2. Insérer un centre de travaux
INSERT INTO formia_agencies (entity_id, name, code, type, parent_agency_id) VALUES
  ('{entity_id}', 'St Gilles Indus', 'SGIX', 'centre', '{parent_agency_id}'),
  ('{entity_id}', 'Sarlat', 'SAR', 'centre', '{parent_agency_id}');
*/
