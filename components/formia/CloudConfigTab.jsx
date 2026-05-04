'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/formia-supabase'
import { toast } from 'sonner'
import { Cloud, HardDrive, Server, Save, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'

export function CloudConfigTab({ entities }) {
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState({ driveKey: false, ftpPassword: false })

  useEffect(() => {
    if (entities.length > 0 && !selectedEntityId) {
      setSelectedEntityId(entities[0].id)
    }
  }, [entities])

  useEffect(() => {
    if (selectedEntityId) loadConfig()
  }, [selectedEntityId])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('formia_cloud_config')
        .select('*')
        .eq('entity_id', selectedEntityId)
        .single()

      setConfig(data || {
        entity_id: selectedEntityId,
        drive_enabled: false,
        drive_service_account_email: '',
        drive_private_key: '',
        drive_folder_id: '',
        ftp_enabled: false,
        ftp_host: '',
        ftp_port: 21,
        ftp_user: '',
        ftp_password: '',
        ftp_path: '/formia/',
        ftp_secure: false
      })
    } catch {
      setConfig({
        entity_id: selectedEntityId,
        drive_enabled: false,
        drive_service_account_email: '',
        drive_private_key: '',
        drive_folder_id: '',
        ftp_enabled: false,
        ftp_host: '',
        ftp_port: 21,
        ftp_user: '',
        ftp_password: '',
        ftp_path: '/formia/',
        ftp_secure: false
      })
    } finally {
      setLoading(false)
    }
  }

  const update = (field, value) => setConfig(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...config, entity_id: selectedEntityId, updated_at: new Date().toISOString() }

      const { error } = await supabase
        .from('formia_cloud_config')
        .upsert(payload, { onConflict: 'entity_id' })

      if (error) throw error
      toast.success('Configuration cloud sauvegardée ✅')
    } catch (err) {
      toast.error(`Erreur : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sélection entité */}
      {entities.length > 1 && (
        <div>
          <Label className="mb-1.5 block">Entité</Label>
          <select
            className="w-full max-w-xs p-2 border rounded-lg bg-white text-sm"
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
          >
            {entities.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Google Drive */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Google Drive</CardTitle>
                <CardDescription className="text-xs">Upload automatique dans un dossier Drive partagé</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {config?.drive_enabled && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Actif</Badge>
              )}
              <Switch
                checked={config?.drive_enabled || false}
                onCheckedChange={(v) => update('drive_enabled', v)}
              />
            </div>
          </div>
        </CardHeader>

        {config?.drive_enabled && (
          <CardContent className="space-y-4 pt-0">
            {/* Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Comment configurer :</p>
              <p>1. Créez un Service Account dans <a href="https://console.cloud.google.com" target="_blank" className="underline">Google Cloud Console</a></p>
              <p>2. Activez l'API Google Drive pour ce projet</p>
              <p>3. Créez une clé JSON → copiez l'email et la clé privée ci-dessous</p>
              <p>4. Partagez votre dossier Drive avec l'email du Service Account</p>
            </div>

            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Email du Service Account *</Label>
              <Input
                placeholder="formia@mon-projet.iam.gserviceaccount.com"
                value={config?.drive_service_account_email || ''}
                onChange={(e) => update('drive_service_account_email', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Clé privée (PEM) *</Label>
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvg...&#10;-----END PRIVATE KEY-----"
                  value={config?.drive_private_key || ''}
                  onChange={(e) => update('drive_private_key', e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs font-mono resize-none focus:outline-none focus:border-blue-400"
                  style={{ filter: showSecrets.driveKey ? 'none' : 'blur(3px)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(s => ({ ...s, driveKey: !s.driveKey }))}
                  className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  {showSecrets.driveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-500 mb-1 block">ID du dossier Drive *</Label>
              <Input
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
                value={config?.drive_folder_id || ''}
                onChange={(e) => update('drive_folder_id', e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                Visible dans l'URL du dossier : drive.google.com/drive/folders/<strong>ID_ICI</strong>
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* FTP / SFTP */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Server className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-base">FTP / SFTP</CardTitle>
                <CardDescription className="text-xs">Upload vers un serveur FTP ou SFTP de l'entreprise</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {config?.ftp_enabled && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Actif</Badge>
              )}
              <Switch
                checked={config?.ftp_enabled || false}
                onCheckedChange={(v) => update('ftp_enabled', v)}
              />
            </div>
          </div>
        </CardHeader>

        {config?.ftp_enabled && (
          <CardContent className="space-y-4 pt-0">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label className="text-xs text-slate-500 mb-1 block">Hôte *</Label>
                <Input
                  placeholder="ftp.mondomaine.fr"
                  value={config?.ftp_host || ''}
                  onChange={(e) => update('ftp_host', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Port</Label>
                <Input
                  type="number"
                  placeholder="21"
                  value={config?.ftp_port || 21}
                  onChange={(e) => update('ftp_port', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Utilisateur *</Label>
                <Input
                  placeholder="formia_user"
                  value={config?.ftp_user || ''}
                  onChange={(e) => update('ftp_user', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    type={showSecrets.ftpPassword ? 'text' : 'password'}
                    value={config?.ftp_password || ''}
                    onChange={(e) => update('ftp_password', e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(s => ({ ...s, ftpPassword: !s.ftpPassword }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecrets.ftpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Dossier distant</Label>
                <Input
                  placeholder="/formia/rapports/"
                  value={config?.ftp_path || '/formia/'}
                  onChange={(e) => update('ftp_path', e.target.value)}
                />
              </div>
              <div className="flex items-end gap-3 pb-0.5">
                <Switch
                  checked={config?.ftp_secure || false}
                  onCheckedChange={(v) => update('ftp_secure', v)}
                />
                <Label className="text-sm cursor-pointer">
                  SFTP (connexion sécurisée)
                </Label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bouton sauvegarder */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-red-600 hover:bg-red-700"
      >
        {saving
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sauvegarde...</>
          : <><Save className="w-4 h-4 mr-2" />Sauvegarder la configuration</>
        }
      </Button>
    </div>
  )
}
