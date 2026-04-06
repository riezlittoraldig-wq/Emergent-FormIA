import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application': 'formia'
    }
  }
})

// Storage helper for FormIA files
export const formiaStorage = {
  uploadLogo: async (file, entityId) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${entityId}_logo.${fileExt}`
    const { data, error } = await supabase.storage
      .from('formia-assets')
      .upload(`logos/${fileName}`, file, { upsert: true })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('formia-assets')
      .getPublicUrl(`logos/${fileName}`)
    
    return publicUrl
  },
  
  uploadPhoto: async (file, documentId, section) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${documentId}_${section}_${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('formia-assets')
      .upload(`photos/${fileName}`, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('formia-assets')
      .getPublicUrl(`photos/${fileName}`)
    
    return publicUrl
  }
}
