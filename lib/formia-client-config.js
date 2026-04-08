import fs from 'fs'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'client.json')

/**
 * Charge la configuration client depuis client.json
 * À utiliser côté serveur uniquement (API routes)
 */
export function loadClientConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return null
    }

    const configData = fs.readFileSync(CONFIG_PATH, 'utf8')
    const config = JSON.parse(configData)

    return config
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error)
    return null
  }
}

/**
 * Vérifie si l'application est configurée
 */
export function isConfigured() {
  const config = loadClientConfig()
  return config && config.configured === true && config.license?.key && config.supabase?.url
}

/**
 * Obtient les credentials Supabase depuis la config
 */
export function getSupabaseCredentials() {
  const config = loadClientConfig()
  
  if (!config || !config.configured) {
    // Fallback sur les variables d'environnement
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }

  return {
    url: config.supabase.url,
    anonKey: config.supabase.anonKey
  }
}

/**
 * Obtient la configuration SMTP
 */
export function getSmtpConfig() {
  const config = loadClientConfig()
  
  if (!config || !config.smtp?.enabled) {
    // Fallback sur les variables d'environnement
    return {
      enabled: false,
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || ''
    }
  }

  return config.smtp
}

/**
 * Obtient la configuration des emails
 */
export function getEmailConfig() {
  const config = loadClientConfig()
  
  if (!config) {
    return {
      secretaire: process.env.SECRETAIRE_EMAIL || '',
      notificationsFrom: process.env.SMTP_USER || 'noreply@formia.app'
    }
  }

  return config.emails || {}
}

/**
 * Obtient le nom de l'organisation
 */
export function getOrganizationName() {
  const config = loadClientConfig()
  return config?.branding?.organizationName || config?.license?.organization || 'FormIA'
}

/**
 * Obtient les informations de licence
 */
export function getLicenseInfo() {
  const config = loadClientConfig()
  return config?.license || null
}
