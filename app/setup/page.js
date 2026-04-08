'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [licenseValid, setLicenseValid] = useState(false)
  const [showKeys, setShowKeys] = useState({ supabase: false, smtp: false })

  const [config, setConfig] = useState({
    licenseKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    organizationName: '',
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    secretaireEmail: ''
  })

  const [licenseInfo, setLicenseInfo] = useState(null)

  // Vérifier si déjà configuré
  useEffect(() => {
    checkIfConfigured()
  }, [])

  const checkIfConfigured = async () => {
    try {
      const res = await fetch('/api/verify-license')
      const data = await res.json()
      if (data.configured && data.valid) {
        // Déjà configuré et licence valide, rediriger
        router.push('/formia/login')
      }
    } catch (error) {
      console.error('Error checking configuration:', error)
    }
  }

  const verifyLicense = async () => {
    if (!config.licenseKey) {
      toast.error('Veuillez entrer une clé de licence')
      return
    }

    setVerifying(true)
    try {
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: config.licenseKey })
      })

      const data = await res.json()

      if (data.valid) {
        setLicenseValid(true)
        setLicenseInfo(data.license)
        setConfig(prev => ({ ...prev, organizationName: data.license.organization }))
        toast.success('Licence valide ! 🎉')
        setTimeout(() => setStep(2), 1000)
      } else {
        toast.error(data.message || 'Licence invalide')
        setLicenseValid(false)
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification')
      console.error(error)
    } finally {
      setVerifying(false)
    }
  }

  const testSupabaseConnection = async () => {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      toast.error('Veuillez remplir les champs Supabase')
      return
    }

    setLoading(true)
    try {
      // Test simple de connexion
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
      
      const { error } = await supabase.from('formia_entities').select('count').limit(1)
      
      if (error && error.code !== 'PGRST116') {
        toast.error('Connexion échouée : ' + error.message)
      } else {
        toast.success('Connexion Supabase réussie !')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const saveConfiguration = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license: {
            key: config.licenseKey,
            organization: licenseInfo.organization,
            plan: licenseInfo.plan,
            maxUsers: licenseInfo.maxUsers,
            expiresAt: licenseInfo.expiresAt
          },
          supabase: {
            url: config.supabaseUrl,
            anonKey: config.supabaseAnonKey
          },
          smtp: config.smtpEnabled ? {
            enabled: true,
            host: config.smtpHost,
            port: parseInt(config.smtpPort),
            secure: config.smtpPort === '465',
            user: config.smtpUser,
            password: config.smtpPassword
          } : { enabled: false },
          branding: {
            organizationName: config.organizationName,
            primaryColor: '#dc2626'
          },
          emails: {
            secretaire: config.secretaireEmail,
            notificationsFrom: config.smtpUser
          }
        })
      })

      if (res.ok) {
        toast.success('Configuration sauvegardée ! 🎉')
        setTimeout(() => {
          router.push('/formia/login')
        }, 1500)
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur serveur')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">
              <span className="text-slate-900">Form</span>
              <span className="text-red-600">IA</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1">by RLD</p>
          </div>
          <CardTitle>Configuration initiale</CardTitle>
          <CardDescription>
            Première installation de FormIA - Étape {step} sur 3
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Étape 1 : Licence */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Activation de la licence</h3>
                <p className="text-sm text-blue-700">
                  Entrez la clé de licence fournie par RLD pour activer votre instance FormIA.
                </p>
              </div>

              <div>
                <Label>Clé de licence *</Label>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={config.licenseKey}
                  onChange={(e) => setConfig({ ...config, licenseKey: e.target.value })}
                  className="font-mono"
                />
              </div>

              {licenseInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Licence valide</h4>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Organisation :</strong> {licenseInfo.organization}</p>
                    <p><strong>Plan :</strong> {licenseInfo.plan.toUpperCase()}</p>
                    <p><strong>Utilisateurs max :</strong> {licenseInfo.maxUsers}</p>
                    <p><strong>Expire le :</strong> {new Date(licenseInfo.expiresAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={verifyLicense}
                disabled={verifying || !config.licenseKey}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  'Vérifier la licence'
                )}
              </Button>
            </div>
          )}

          {/* Étape 2 : Supabase */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🗄️ Configuration Supabase</h3>
                <p className="text-sm text-blue-700">
                  Connectez votre projet Supabase pour stocker vos données.
                </p>
              </div>

              <div>
                <Label>Nom de l'organisation</Label>
                <Input
                  value={config.organizationName}
                  onChange={(e) => setConfig({ ...config, organizationName: e.target.value })}
                />
              </div>

              <div>
                <Label>Supabase URL *</Label>
                <Input
                  placeholder="https://xxxxxxxxxxxx.supabase.co"
                  value={config.supabaseUrl}
                  onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                />
              </div>

              <div>
                <Label>Supabase Anon Key *</Label>
                <div className="relative">
                  <Input
                    type={showKeys.supabase ? 'text' : 'password'}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.supabaseAnonKey}
                    onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, supabase: !showKeys.supabase })}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showKeys.supabase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button variant="outline" onClick={testSupabaseConnection} disabled={loading}>
                Tester la connexion
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!config.supabaseUrl || !config.supabaseAnonKey}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3 : SMTP (optionnel) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📧 Configuration email (optionnel)</h3>
                <p className="text-sm text-blue-700">
                  Configurez l'envoi d'emails automatiques pour les rapports.
                </p>
              </div>

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
                    <Label>Email SMTP</Label>
                    <Input
                      type="email"
                      placeholder="noreply@votredomaine.fr"
                      value={config.smtpUser}
                      onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Mot de passe SMTP</Label>
                    <div className="relative">
                      <Input
                        type={showKeys.smtp ? 'text' : 'password'}
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
                  </div>

                  <div>
                    <Label>Email de la secrétaire (reçoit tous les rapports en copie)</Label>
                    <Input
                      type="email"
                      placeholder="secretaire@votredomaine.fr"
                      value={config.secretaireEmail}
                      onChange={(e) => setConfig({ ...config, secretaireEmail: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Retour
                </Button>
                <Button
                  onClick={saveConfiguration}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    'Terminer la configuration'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
