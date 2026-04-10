-- Ajouter la colonne adress_2 à la table formia_chantiers
ALTER TABLE formia_chantiers 
ADD COLUMN IF NOT EXISTS adress_2 TEXT;

COMMENT ON COLUMN formia_chantiers.adress_2 IS 'Complément d''adresse (ligne 2)';
