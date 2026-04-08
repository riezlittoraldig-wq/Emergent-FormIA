'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Save, X, Upload, Image } from 'lucide-react'
import { supabase, formiaStorage } from '@/lib/formia-supabase'
import { toast } from 'sonner'

export function EntitiesTab({ entities, onReload }) {
  const [editingEntity, setEditingEntity] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef(null)

  const handleSaveEntity = async () => {
    try {
      const entityData = {
        name: editingEntity.name,
        primary_color: editingEntity.primary_color || '#E63946',
        contact_info: {
          agency: editingEntity.agency || '',
          service: editingEntity.service || '',
          address: editingEntity.address || '',
          postal_code: editingEntity.postal_code || '',
          city: editingEntity.city || '',
          phone: editingEntity.phone || '',
          email: editingEntity.email || '',
          group: editingEntity.group || ''
        },
        logo_url: editingEntity.logo_url || null
      }

      if (editingEntity.id) {
        const { error } = await supabase
          .from('formia_entities')
          .update(entityData)
          .eq('id', editingEntity.id)
        if (error) throw error
        toast.success('Entité mise à jour')
      } else {
        const { error } = await supabase
          .from('formia_entities')
          .insert(entityData)
        if (error) throw error
        toast.success('Entité créée')
      }
      
      setEditingEntity(null)
      onReload()
    } catch (error) {
      console.error('Error saving entity:', error)
      toast.error(`Erreur: ${error.message}`)
    }
  }

  const handleDeleteEntity = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entité ? Toutes les agences et chantiers associés seront également supprimés.')) return
    try {
      const { error } = await supabase.from('formia_entities').delete().eq('id', id)
      if (error) throw error
      toast.success('Entité supprimée')
      onReload()
    } catch (error) {
      console.error('Error deleting entity:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!editingEntity.id) {
      toast.error('Veuillez d\'abord enregistrer l\'entité avant d\'uploader un logo')
      return
    }

    setUploadingLogo(true)
    try {
      const logoUrl = await formiaStorage.uploadLogo(file, editingEntity.id)
      setEditingEntity({ ...editingEntity, logo_url: logoUrl })
      
      // Mettre à jour directement dans la base
      await supabase
        .from('formia_entities')
        .update({ logo_url: logoUrl })
        .eq('id', editingEntity.id)
      
      toast.success('Logo uploadé avec succès')
      onReload()
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Erreur lors de l\'upload du logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-600">Gérez les entités du groupe (ALLEZ Saint-Gilles, ALLEZ Brives, etc.)</p>
        <Button onClick={() => setEditingEntity({ 
          name: '', 
          primary_color: '#E63946',
          agency: '',
          service: '',
          address: '', 
          postal_code: '', 
          city: '', 
          phone: '', 
          email: '',
          group: '',
          logo_url: null
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entité
        </Button>
      </div>

      {/* Formulaire d'édition */}
      {editingEntity && (
        <Card className="border-red-600 border-2">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">
                {editingEntity.id ? 'Modifier l\'entité' : 'Nouvelle entité'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingEntity(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nom de l'entité *</Label>
                <Input 
                  placeholder="Ex: ALLEZ ENERGIES Saint-Gilles"
                  value={editingEntity.name}
                  onChange={(e) => setEditingEntity({...editingEntity, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur principale</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    value={editingEntity.primary_color}
                    onChange={(e) => setEditingEntity({...editingEntity, primary_color: e.target.value})}
                    className="w-20"
                  />
                  <Input 
                    value={editingEntity.primary_color}
                    onChange={(e) => setEditingEntity({...editingEntity, primary_color: e.target.value})}
                    placeholder="#E63946"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Agence / Direction</Label>
                <Input 
                  placeholder="Ex: Agence Industrie, Tertiaire et Photovoltaïque"
                  value={editingEntity.agency}
                  onChange={(e) => setEditingEntity({...editingEntity, agency: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Input 
                  placeholder="Ex: Service Maintenance"
                  value={editingEntity.service}
                  onChange={(e) => setEditingEntity({...editingEntity, service: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input 
                placeholder="Ex: 15 rue des Couvreurs"
                value={editingEntity.address}
                onChange={(e) => setEditingEntity({...editingEntity, address: e.target.value})}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Code postal</Label>
                <Input 
                  placeholder="Ex: 85800"
                  value={editingEntity.postal_code}
                  onChange={(e) => setEditingEntity({...editingEntity, postal_code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input 
                  placeholder="Ex: SAINT GILLES CROIX DE VIE"
                  value={editingEntity.city}
                  onChange={(e) => setEditingEntity({...editingEntity, city: e.target.value})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input 
                  placeholder="Ex: 02.51.60.00.00"
                  value={editingEntity.phone}
                  onChange={(e) => setEditingEntity({...editingEntity, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="Ex: contact@allez.fr"
                  value={editingEntity.email}
                  onChange={(e) => setEditingEntity({...editingEntity, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Groupe</Label>
              <Input 
                placeholder="Ex: Groupe Allez"
                value={editingEntity.group}
                onChange={(e) => setEditingEntity({...editingEntity, group: e.target.value})}
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              {editingEntity.logo_url ? (
                <div className="flex items-center gap-4">
                  <img src={editingEntity.logo_url} alt="Logo" className="h-16 object-contain border rounded p-2" />
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => logoInputRef.current?.click()}
                      disabled={!editingEntity.id || uploadingLogo}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Changer le logo
                    </Button>
                    {!editingEntity.id && <p className="text-xs text-slate-500 mt-1">Enregistrez d'abord l'entité</p>}
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => logoInputRef.current?.click()}
                  disabled={!editingEntity.id || uploadingLogo}
                  className="w-full"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {editingEntity.id ? 'Uploader un logo' : 'Enregistrez d\'abord l\'entité'}
                </Button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEntity} disabled={!editingEntity.name}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              <Button variant="outline" onClick={() => setEditingEntity(null)}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des entités */}
      <div className="space-y-4">
        {entities.map(entity => (
          <Card key={entity.id}>
            <CardContent className="p-6 flex justify-between items-start">
              <div className="flex gap-4">
                {entity.logo_url && (
                  <img src={entity.logo_url} alt={entity.name} className="h-16 object-contain" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{entity.name}</h3>
                  {entity.contact_info?.group && (
                    <p className="text-sm text-slate-600">{entity.contact_info.group}</p>
                  )}
                  {entity.contact_info?.address && (
                    <p className="text-sm text-slate-600">
                      {entity.contact_info.address}, {entity.contact_info.postal_code} {entity.contact_info.city}
                    </p>
                  )}
                  {entity.contact_info?.phone && entity.contact_info?.email && (
                    <p className="text-sm text-slate-600">
                      {entity.contact_info.phone} | {entity.contact_info.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingEntity({
                    ...entity,
                    ...entity.contact_info
                  })
                }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteEntity(entity.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
