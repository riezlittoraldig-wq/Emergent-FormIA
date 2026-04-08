'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/formia-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, Save, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showKeys, setShowKeys] = useState({ smtp: false })
  const [message, setMessage] = useState(null)

  const [config, setConfig] = useState({
    organizationName: '',
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    secretaireEmail: '',
    licenseKey: '',
    licenseOrganization: '',
    licensePlan: '',
    licenseExpires: ''
  })

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (profile && profile.role !== 'super_admin') {
      router.push('/formia')
    }
  }, [profile, router])

  // Charger la configuration actuelle
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/config')
      if (res.ok) {
        const data = await res.json()
        setConfig({
          organizationName: data.branding?.organizationName || '',
          smtpEnabled: data.smtp?.enabled || false,
          smtpHost: data.smtp?.host || '',
          smtpPort: data.smtp?.port?.toString() || '587',
          smtpUser: '',
          smtpPassword: '',
          secretaireEmail: '',
          licenseKey: '',
          licenseOrganization: data.license?.organization || '',
          licensePlan: data.license?.plan || '',
          licenseExpires: data.license?.expiresAt ? new Date(data.license.expiresAt).toLocaleDateString('fr-FR') : ''
        })
      }
    } catch (error) {
      console.error('Error loading config:', error)
      showMessage('Erreur lors du chargement de la configuration', 'error')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setMessage(null)
    try {
      // Récupérer la config complète actuelle
      const currentRes = await fetch('/api/config')
      const currentConfig = await currentRes.json()

      // Merger avec les nouvelles valeurs
      const updatedConfig = {
        ...currentConfig,
        branding: {
          ...currentConfig.branding,
          organizationName: config.organizationName
        },
        smtp: {
          enabled: config.smtpEnabled,
          host: config.smtpHost,
          port: parseInt(config.smtpPort),
          secure: config.smtpPort === '465',
          user: config.smtpUser || currentConfig.smtp?.user,
          password: config.smtpPassword || currentConfig.smtp?.password
        },
        emails: {
          secretaire: config.secretaireEmail || currentConfig.emails?.secretaire,
          notificationsFrom: config.smtpUser || currentConfig.emails?.notificationsFrom
        },
        license: currentConfig.license,
        supabase: currentConfig.supabase
      }

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      })

      if (res.ok) {
        showMessage('Configuration sauvegardée avec succès !', 'success')
        // Recharger après 1s
        setTimeout(() => loadConfig(), 1000)
      } else {
        showMessage('Erreur lors de la sauvegarde', 'error')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      showMessage('Erreur serveur', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-red-600" />
            Paramètres
          </h1>
          <p className="text-slate-600 mt-2">Gérez la configuration de votre instance FormIA</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Informations de licence */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations de licence</CardTitle>
            <CardDescription>Licence actuelle de votre instance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Organisation</Label>
                <Input value={config.licenseOrganization} disabled className="bg-slate-100" />
              </div>
              <div>
                <Label>Plan</Label>
                <Input value={config.licensePlan?.toUpperCase()} disabled className="bg-slate-100" />
              </div>
              <div>
                <Label>Expire le</Label>
                <Input value={config.licenseExpires} disabled className="bg-slate-100" />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Pour modifier votre licence, contactez RLD : <a href="mailto:support@rld.fr" className="text-red-600 underline">support@rld.fr</a>
            </p>
          </CardContent>
        </Card>

        {/* Paramètres généraux */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paramètres généraux</CardTitle>
            <CardDescription>Informations de base de votre organisation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de l'organisation</Label>
              <Input
                value={config.organizationName}
                onChange={(e) => setConfig({ ...config, organizationName: e.target.value })}
                placeholder="RLD Électrique"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration SMTP */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration Email (SMTP)</CardTitle>
            <CardDescription>Paramètres pour l'envoi automatique des rapports par email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smtp-enabled"
                checked={config.smtpEnabled}
                onChange={(e) => setConfig({ ...config, smtpEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="smtp-enabled" className="cursor-pointer">
                Activer l'envoi d'emails
              </Label>
            </div>

            {config.smtpEnabled && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Serveur SMTP</Label>
                    <Input
                      placeholder="smtp.gmail.com"
                      value={config.smtpHost}
                      onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input
                      placeholder="587"
                      value={config.smtpPort}
                      onChange={(e) => setConfig({ ...config, smtpPort: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email SMTP (expéditeur)</Label>
                  <Input
                    type="email"
                    placeholder="noreply@votredomaine.fr"
                    value={config.smtpUser}
                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1">Laissez vide pour conserver la valeur actuelle</p>
                </div>

                <div>
                  <Label>Mot de passe SMTP</Label>
                  <div className="relative">
                    <Input
                      type={showKeys.smtp ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={config.smtpPassword}
                      onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys({ ...showKeys, smtp: !showKeys.smtp })}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showKeys.smtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Laissez vide pour conserver le mot de passe actuel</p>
                </div>

                <div>
                  <Label>Email de la secrétaire (copie automatique)</Label>
                  <Input
                    type="email"
                    placeholder="secretaire@votredomaine.fr"
                    value={config.secretaireEmail}
                    onChange={(e) => setConfig({ ...config, secretaireEmail: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1">Cet email recevra une copie de tous les rapports générés</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>💡 Note pour Gmail :</strong> Utilisez un "Mot de passe d'application" au lieu de votre mot de passe habituel.
                  <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener" className="underline ml-1">
                    En savoir plus
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 flex-1"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/formia')}
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  )
}
