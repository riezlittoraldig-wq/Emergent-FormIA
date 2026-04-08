const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cywwdjmzaytjreprgatf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d3dkam16YXl0anJlcHJnYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjg4OTksImV4cCI6MjA4OTc0NDg5OX0.NTsjryreV9p1Z5E-OsccCWc-TqkhZzRm_7EjnEluBvM';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCentresTravauxTable() {
  console.log('🔧 Création de la table formia_centres_travaux...\n');
  
  // Vérifier si la table existe déjà
  const { data: existingTable, error: checkError } = await supabase
    .from('formia_centres_travaux')
    .select('id')
    .limit(1);
  
  if (!checkError || checkError.code === 'PGRST116') {
    // Table existe déjà ou n'existe pas
    if (!checkError) {
      console.log('✅ La table formia_centres_travaux existe déjà!');
      
      // Afficher le nombre d'enregistrements
      const { count } = await supabase
        .from('formia_centres_travaux')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 Nombre de centres de travaux: ${count || 0}`);
      return;
    }
  }
  
  console.log('⚠️  La table n\'existe pas encore.');
  console.log('\n📝 Vous devez exécuter ce SQL dans Supabase SQL Editor:\n');
  console.log('---------------------------------------------------');
  console.log(`
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

CREATE INDEX IF NOT EXISTS idx_formia_centres_agency ON formia_centres_travaux(agency_id);

COMMENT ON TABLE formia_centres_travaux IS 'Centres de travaux rattachés aux agences';
  `);
  console.log('---------------------------------------------------\n');
  console.log('🌐 URL: ' + supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/') + '/editor');
}

createCentresTravauxTable().catch(console.error);
