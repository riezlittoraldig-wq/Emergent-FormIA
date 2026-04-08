import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase CENTRAL RLD (pour vérifier les licences)
// À configurer avec VOS credentials Supabase centrales
const CENTRAL_SUPABASE_URL = process.env.CENTRAL_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const CENTRAL_SUPABASE_KEY = process.env.CENTRAL_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const { licenseKey } = await request.json()

    if (!licenseKey) {
      return NextResponse.json(
        { valid: false, message: 'Clé de licence requise' },
        { status: 400 }
      )
    }

    // Connexion au Supabase central
    const centralSupabase = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_KEY)

    // Appeler la fonction verify_formia_license
    const { data, error } = await centralSupabase
      .rpc('verify_formia_license', { p_license_key: licenseKey })

    if (error) {
      console.error('License verification error:', error)
      return NextResponse.json(
        { valid: false, message: 'Erreur lors de la vérification de la licence' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { valid: false, message: 'Licence introuvable' },
        { status: 404 }
      )
    }

    const licenseData = data[0]

    return NextResponse.json({
      valid: licenseData.is_valid,
      license: {
        organization: licenseData.organization_name,
        plan: licenseData.plan_type,
        maxUsers: licenseData.max_users,
        expiresAt: licenseData.expires_at,
        status: licenseData.status,
        features: licenseData.features
      },
      message: licenseData.message
    })
  } catch (error) {
    console.error('License API error:', error)
    return NextResponse.json(
      { valid: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET pour vérifier la licence actuelle (depuis la config)
export async function GET() {
  try {
    const fs = require('fs')
    const path = require('path')
    const configPath = path.join(process.cwd(), 'config', 'client.json')

    // Vérifier si le fichier existe
    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { configured: false, message: 'Configuration non initialisée' },
        { status: 200 }
      )
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

    if (!config.configured || !config.license?.key) {
      return NextResponse.json(
        { configured: false, message: 'Licence non configurée' },
        { status: 200 }
      )
    }

    // Vérifier la licence actuelle
    const centralSupabase = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_KEY)
    const { data, error } = await centralSupabase
      .rpc('verify_formia_license', { p_license_key: config.license.key })

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        configured: true,
        valid: false,
        message: 'Licence invalide ou expirée'
      })
    }

    const licenseData = data[0]

    return NextResponse.json({
      configured: true,
      valid: licenseData.is_valid,
      license: {
        organization: licenseData.organization_name,
        plan: licenseData.plan_type,
        maxUsers: licenseData.max_users,
        expiresAt: licenseData.expires_at,
        status: licenseData.status
      },
      message: licenseData.message
    })
  } catch (error) {
    console.error('License check error:', error)
    return NextResponse.json(
      { configured: false, message: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
