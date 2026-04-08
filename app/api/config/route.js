import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'client.json')

// GET - Récupérer la configuration actuelle
export async function GET() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return NextResponse.json(
        { configured: false, message: 'Configuration non trouvée' },
        { status: 404 }
      )
    }

    const configData = fs.readFileSync(CONFIG_PATH, 'utf8')
    const config = JSON.parse(configData)

    // Ne pas exposer les clés sensibles
    const safeConfig = {
      configured: config.configured || false,
      license: {
        organization: config.license?.organization || '',
        plan: config.license?.plan || '',
        maxUsers: config.license?.maxUsers || 0,
        expiresAt: config.license?.expiresAt || ''
      },
      branding: config.branding || {},
      smtp: {
        enabled: config.smtp?.enabled || false,
        host: config.smtp?.host || ''
      }
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('Error reading config:', error)
    return NextResponse.json(
      { error: 'Erreur de lecture de la configuration' },
      { status: 500 }
    )
  }
}

// POST - Sauvegarder la configuration
export async function POST(request) {
  try {
    const configData = await request.json()

    // Valider les données requises
    if (!configData.license?.key) {
      return NextResponse.json(
        { error: 'Clé de licence requise' },
        { status: 400 }
      )
    }

    if (!configData.supabase?.url || !configData.supabase?.anonKey) {
      return NextResponse.json(
        { error: 'Configuration Supabase requise' },
        { status: 400 }
      )
    }

    // Créer l'objet de configuration complet
    const fullConfig = {
      configured: true,
      license: {
        key: configData.license.key,
        organization: configData.license.organization || '',
        plan: configData.license.plan || 'standard',
        maxUsers: configData.license.maxUsers || 1,
        expiresAt: configData.license.expiresAt || '',
        lastVerified: new Date().toISOString()
      },
      supabase: {
        url: configData.supabase.url,
        anonKey: configData.supabase.anonKey
      },
      smtp: {
        enabled: configData.smtp?.enabled || false,
        host: configData.smtp?.host || '',
        port: configData.smtp?.port || 587,
        secure: configData.smtp?.secure || false,
        user: configData.smtp?.user || '',
        password: configData.smtp?.password || ''
      },
      branding: {
        organizationName: configData.branding?.organizationName || configData.license.organization,
        logo: configData.branding?.logo || '',
        primaryColor: configData.branding?.primaryColor || '#dc2626'
      },
      emails: {
        secretaire: configData.emails?.secretaire || '',
        notificationsFrom: configData.emails?.notificationsFrom || configData.smtp?.user || ''
      },
      createdAt: configData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Créer le dossier config s'il n'existe pas
    const configDir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    // Écrire le fichier de configuration
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(fullConfig, null, 2), 'utf8')

    console.log('✅ Configuration sauvegardée avec succès dans:', CONFIG_PATH)

    return NextResponse.json({
      success: true,
      message: 'Configuration sauvegardée avec succès',
      configured: true
    })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la configuration' },
      { status: 500 }
    )
  }
}

// DELETE - Réinitialiser la configuration (pour debug/test)
export async function DELETE() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH)
      return NextResponse.json({
        success: true,
        message: 'Configuration supprimée'
      })
    }

    return NextResponse.json(
      { message: 'Aucune configuration à supprimer' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error deleting config:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
