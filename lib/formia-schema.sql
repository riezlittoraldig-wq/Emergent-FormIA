-- FormIA Database Schema
-- Execute this SQL in Supabase SQL Editor

-- Entities table (ALLEZ ENERGIES, etc.)
CREATE TABLE IF NOT EXISTS formia_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#E63946',
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document types (Rapport Maintenance HT/BT, etc.)
CREATE TABLE IF NOT EXISTS formia_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates (structure of forms)
CREATE TABLE IF NOT EXISTS formia_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES formia_entities(id) ON DELETE CASCADE,
  document_type_id UUID REFERENCES formia_document_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  structure_json JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated documents
CREATE TABLE IF NOT EXISTS formia_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES formia_entities(id) ON DELETE CASCADE,
  template_id UUID REFERENCES formia_templates(id) ON DELETE SET NULL,
  document_type_id UUID REFERENCES formia_document_types(id) ON DELETE CASCADE,
  document_number VARCHAR(50) NOT NULL UNIQUE,
  client_name VARCHAR(255),
  data_json JSONB NOT NULL DEFAULT '{}',
  pdf_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  user_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media files (photos)
CREATE TABLE IF NOT EXISTS formia_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES formia_documents(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  section VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_formia_documents_entity ON formia_documents(entity_id);
CREATE INDEX IF NOT EXISTS idx_formia_documents_status ON formia_documents(status);
CREATE INDEX IF NOT EXISTS idx_formia_documents_created ON formia_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_formia_media_document ON formia_media(document_id);

-- Insert default entity: ALLEZ ENERGIES
INSERT INTO formia_entities (name, primary_color, contact_info) VALUES (
  'ALLEZ ENERGIES',
  '#E63946',
  '{
    "agency": "Agence Industrie, Tertiaire et Photovoltaïque",
    "service": "Service Maintenance",
    "address": "15 rue des Couvreurs",
    "postal_code": "85800",
    "city": "SAINT GILLES CROIX DE VIE",
    "phone": "02.51.60.00.00",
    "email": "maintenance.stgilles@allez.fr",
    "group": "Groupe Allez"
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert default document type
INSERT INTO formia_document_types (name, slug, description) VALUES (
  'Rapport de Maintenance HT/BT',
  'maintenance-ht-bt',
  'Rapport de maintenance haute tension / basse tension'
) ON CONFLICT (slug) DO NOTHING;

-- Create storage bucket for FormIA assets
-- Note: Run this in Supabase Dashboard > Storage or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('formia-assets', 'formia-assets', true);

-- Enable Row Level Security (RLS) - Optional for MVP, can be enabled later
-- ALTER TABLE formia_entities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE formia_documents ENABLE ROW LEVEL SECURITY;
-- etc.
