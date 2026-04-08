'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/formia-supabase'
import { Plus, Edit, Trash2, Save, X, Building2, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

export default function FormIAAdminPage() {
  const [entities, setEntities] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [agencies, setAgencies] = useState([])
  const [chantiers, setChantiers] = useState([])
  const [editingAgency, setEditingAgency] = useState(null)
  const [editingChantier, setEditingChantier] = useState(null)

  useEffect(() => {
    loadEntities()
  }, [])

  useEffect(() => {
    if (selectedEntity) {
      loadAgencies()
      loadChantiers()
    }
  }, [selectedEntity])

  const loadEntities = async () => {
    const { data } = await supabase.from('formia_entities').select('*').order('name')
    setEntities(data || [])
    if (data && data.length > 0) {
      setSelectedEntity(data[0])
    }
  }

  const loadAgencies = async () => {
    const { data } = await supabase
      .from('formia_agencies')
      .select('*')
      .eq('entity_id', selectedEntity.id)
      .order('name')
    setAgencies(data || [])
  }

  const loadChantiers = async () => {
    const { data } = await supabase
      .from('formia_chantiers')
      .select('*, formia_agencies(name)')
      .eq('entity_id', selectedEntity.id)
      .order('code_chantier')
    setChantiers(data || [])
  }

  const handleSaveAgency = async () => {
    try {
      if (editingAgency.id) {
        const { error } = await supabase
          .from('formia_agencies')
          .update(editingAgency)
          .eq('id', editingAgency.id)
        if (error) throw error
        toast.success('Agence mise à jour')
      } else {
        const { error } = await supabase
          .from('formia_agencies')
          .insert({ ...editingAgency, entity_id: selectedEntity.id })
        if (error) throw error
        toast.success('Agence créée')
      }
      setEditingAgency(null)
      loadAgencies()
    } catch (error) {
      console.error('Error saving agency:', error)
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const handleDeleteAgency = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) return
    try {
      const { error } = await supabase.from('formia_agencies').delete().eq('id', id)
      if (error) throw error
      toast.success('Agence supprimée')
      loadAgencies()
    } catch (error) {
      console.error('Error deleting agency:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleSaveChantier = async () => {
    try {
      // Convertir les emails en tableau PostgreSQL
      let emailsArray = []
      if (typeof editingChantier.emails === 'string') {
        emailsArray = editingChantier.emails
          .split(',')
          .map(e => e.trim())
          .filter(Boolean)
      } else if (Array.isArray(editingChantier.emails)) {
        emailsArray = editingChantier.emails.filter(Boolean)
      }

      const chantierData = { 
        code_chantier: editingChantier.code_chantier,
        client_name: editingChantier.client_name,
        address: editingChantier.address || null,
        postal_code: editingChantier.postal_code || null,
        city: editingChantier.city || null,
        responsable_affaire: editingChantier.responsable_affaire || null,
        emails: emailsArray.length > 0 ? emailsArray : null,
        entity_id: selectedEntity.id,
        agency_id: editingChantier.agency_id || null,
        notes: editingChantier.notes || null
      }

      if (editingChantier.id) {
        const { error } = await supabase
          .from('formia_chantiers')
          .update(chantierData)
          .eq('id', editingChantier.id)
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        toast.success('Chantier mis à jour')
      } else {
        const { error } = await supabase
          .from('formia_chantiers')
          .insert(chantierData)
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        toast.success('Chantier créé')
      }
      setEditingChantier(null)
      loadChantiers()
    } catch (error) {
      console.error('Error saving chantier:', error)
      toast.error(`Erreur: ${error.message || 'Erreur lors de l\'enregistrement'}`)
    }
  }

  const handleDeleteChantier = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) return
    try {
      const { error } = await supabase.from('formia_chantiers').delete().eq('id', id)
      if (error) throw error
      toast.success('Chantier supprimé')
      loadChantiers()
    } catch (error) {
      console.error('Error deleting chantier:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">FormIA - Administration</h1>
          <p className="text-slate-600">Gestion des agences et chantiers</p>
        </div>

        {selectedEntity && (
          <div className="mb-6">
            <Label>Entité</Label>
            <select 
              className="w-full max-w-md p-2 border rounded"
              value={selectedEntity.id}
              onChange={(e) => setSelectedEntity(entities.find(ent => ent.id === e.target.value))}
            >
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
          </div>
        )}

        <Tabs defaultValue="agencies">
          <TabsList className="mb-6">
            <TabsTrigger value="agencies">
              <Building2 className="w-4 h-4 mr-2" />
              Agences
            </TabsTrigger>
            <TabsTrigger value="chantiers">
              <Briefcase className="w-4 h-4 mr-2" />
              Chantiers
            </TabsTrigger>
          </TabsList>

          {/* Tab Agences */}
          <TabsContent value="agencies">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Agences de {selectedEntity?.name}</CardTitle>
                  <Button onClick={() => setEditingAgency({ name: '', code: '', address: '', postal_code: '', city: '', phone: '', email: '' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle agence
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editingAgency && (
                  <Card className="mb-6 border-red-600">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom de l'agence *</Label>
                          <Input value={editingAgency.name} onChange={(e) => setEditingAgency({...editingAgency, name: e.target.value})} />
                        </div>
                        <div>
                          <Label>Code</Label>
                          <Input value={editingAgency.code} onChange={(e) => setEditingAgency({...editingAgency, code: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>Adresse</Label>
                        <Input value={editingAgency.address} onChange={(e) => setEditingAgency({...editingAgency, address: e.target.value})} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Code postal</Label>
                          <Input value={editingAgency.postal_code} onChange={(e) => setEditingAgency({...editingAgency, postal_code: e.target.value})} />
                        </div>
                        <div>
                          <Label>Ville</Label>
                          <Input value={editingAgency.city} onChange={(e) => setEditingAgency({...editingAgency, city: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Téléphone</Label>
                          <Input value={editingAgency.phone} onChange={(e) => setEditingAgency({...editingAgency, phone: e.target.value})} />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={editingAgency.email} onChange={(e) => setEditingAgency({...editingAgency, email: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveAgency}><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                        <Button variant="outline" onClick={() => setEditingAgency(null)}><X className="w-4 h-4 mr-2" />Annuler</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {agencies.map(agency => (
                    <Card key={agency.id}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{agency.name}</h3>
                          {agency.code && <p className="text-sm text-slate-600">Code: {agency.code}</p>}
                          <p className="text-sm text-slate-600">{agency.address}, {agency.postal_code} {agency.city}</p>
                          <p className="text-sm text-slate-600">{agency.phone} | {agency.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingAgency(agency)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAgency(agency.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Chantiers */}
          <TabsContent value="chantiers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Chantiers de {selectedEntity?.name}</CardTitle>
                  <Button onClick={() => setEditingChantier({ code_chantier: '', client_name: '', address: '', postal_code: '', city: '', responsable_affaire: '', emails: '', agency_id: null })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau chantier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editingChantier && (
                  <Card className="mb-6 border-red-600">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Code chantier *</Label>
                          <Input value={editingChantier.code_chantier} onChange={(e) => setEditingChantier({...editingChantier, code_chantier: e.target.value})} />
                        </div>
                        <div>
                          <Label>Nom client *</Label>
                          <Input value={editingChantier.client_name} onChange={(e) => setEditingChantier({...editingChantier, client_name: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>Adresse</Label>
                        <Input value={editingChantier.address} onChange={(e) => setEditingChantier({...editingChantier, address: e.target.value})} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Code postal</Label>
                          <Input value={editingChantier.postal_code} onChange={(e) => setEditingChantier({...editingChantier, postal_code: e.target.value})} />
                        </div>
                        <div>
                          <Label>Ville</Label>
                          <Input value={editingChantier.city} onChange={(e) => setEditingChantier({...editingChantier, city: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>Agence rattachée</Label>
                        <select 
                          className="w-full p-2 border rounded"
                          value={editingChantier.agency_id || ''}
                          onChange={(e) => setEditingChantier({...editingChantier, agency_id: e.target.value || null})}
                        >
                          <option value="">Aucune</option>
                          {agencies.map(agency => (
                            <option key={agency.id} value={agency.id}>{agency.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Responsable d'affaire</Label>
                        <Input value={editingChantier.responsable_affaire} onChange={(e) => setEditingChantier({...editingChantier, responsable_affaire: e.target.value})} />
                      </div>
                      <div>
                        <Label>Emails (séparés par des virgules)</Label>
                        <Input 
                          placeholder="email1@example.com, email2@example.com"
                          value={Array.isArray(editingChantier.emails) ? editingChantier.emails.join(', ') : editingChantier.emails} 
                          onChange={(e) => setEditingChantier({...editingChantier, emails: e.target.value})} 
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea value={editingChantier.notes || ''} onChange={(e) => setEditingChantier({...editingChantier, notes: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveChantier}><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                        <Button variant="outline" onClick={() => setEditingChantier(null)}><X className="w-4 h-4 mr-2" />Annuler</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {chantiers.map(chantier => (
                    <Card key={chantier.id}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{chantier.code_chantier}</h3>
                          <p className="text-slate-600">{chantier.client_name}</p>
                          <p className="text-sm text-slate-600">{chantier.address}, {chantier.postal_code} {chantier.city}</p>
                          {chantier.responsable_affaire && <p className="text-sm text-slate-600">Resp: {chantier.responsable_affaire}</p>}
                          {chantier.formia_agencies && <p className="text-sm text-slate-500">Agence: {chantier.formia_agencies.name}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingChantier({
                            ...chantier,
                            emails: Array.isArray(chantier.emails) ? chantier.emails.join(', ') : ''
                          })}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteChantier(chantier.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
