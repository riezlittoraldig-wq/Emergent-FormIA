'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/formia-supabase'
import { ImportExcel } from '@/components/formia/ImportExcel'
import { EntitiesTab } from '@/components/formia/EntitiesTab'
import { Plus, Edit, Trash2, Save, X, Building2, Briefcase, Building, Upload, MapPin, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function FormIAAdminPage() {
  const [entities, setEntities] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [agencies, setAgencies] = useState([])
  const [chantiers, setChantiers] = useState([])
  const [users, setUsers] = useState([])
  const [editingEntity, setEditingEntity] = useState(null)
  const [editingAgency, setEditingAgency] = useState(null)
  const [editingChantier, setEditingChantier] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    loadEntities()
    loadUsers()
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

  const loadUsers = async () => {
    const { data } = await supabase
      .from('formia_user_profiles')
      .select('*, formia_entities(name), formia_agencies(name, code)')
      .order('nom')
    setUsers(data || [])
  }

  const handleSaveUser = async () => {
    try {
      if (editingUser.id) {
        const { error } = await supabase
          .from('formia_user_profiles')
          .update({
            prenom: editingUser.prenom,
            nom: editingUser.nom,
            phone: editingUser.phone,
            role: editingUser.role,
            entity_id: editingUser.entity_id || null,
            agency_id: editingUser.agency_id || null
          })
          .eq('id', editingUser.id)
        
        if (error) throw error
        toast.success('Utilisateur mis à jour')
        setEditingUser(null)
        loadUsers()
      } else {
        toast.error('Création d\'utilisateur : Utilisez Supabase Auth Dashboard')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    try {
      const { error } = await supabase.from('formia_user_profiles').delete().eq('id', id)
      if (error) throw error
      toast.success('Utilisateur supprimé')
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Erreur lors de la suppression')
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

        <Tabs defaultValue="entities">
          <TabsList className="mb-6">
            <TabsTrigger value="entities">
              <Building className="w-4 h-4 mr-2" />
              Entités
            </TabsTrigger>
            <TabsTrigger value="agencies">
              <Building2 className="w-4 h-4 mr-2" />
              Agences
            </TabsTrigger>
            <TabsTrigger value="chantiers">
              <Briefcase className="w-4 h-4 mr-2" />
              Chantiers
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          {/* Tab Entités */}
          <TabsContent value="entities">
            <EntitiesTab entities={entities} onReload={loadEntities} />
          </TabsContent>

          {/* Tab Agences */}
          <TabsContent value="agencies">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Agences de {selectedEntity?.name}</CardTitle>
                  <Button onClick={() => setEditingAgency({ name: '', code: '', type: 'agence', parent_agency_id: null, address: '', postal_code: '', city: '', phone: '', email: '' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle agence/centre
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Section Import Excel */}
                <div className="mb-8">
                  <ImportExcel
                    title="Import Excel - Agences (toutes entités)"
                    templateName="template_agences_groupe"
                    templateColumns={[
                      { key: 'entite', label: 'Entité', required: true, example: 'ALLEZ ENERGIES' },
                      { key: 'code', label: 'Code ERP', required: true, example: 'SGCV' },
                      { key: 'name', label: 'Nom', required: true, example: 'Saint-Gilles-Croix-de-Vie' },
                      { key: 'type', label: 'Type', required: true, example: 'agence' },
                      { key: 'parent_code', label: 'Code agence parente', example: 'SGCV' },
                      { key: 'address', label: 'Adresse', example: '15 rue des Couvreurs' },
                      { key: 'postal_code', label: 'Code postal', example: '85800' },
                      { key: 'city', label: 'Ville', example: 'SAINT GILLES CROIX DE VIE' },
                      { key: 'phone', label: 'Téléphone', example: '02.51.60.00.00' },
                      { key: 'email', label: 'Email', example: 'contact@allez.fr' }
                    ]}
                    exampleData={[
                      { entite: 'ALLEZ ENERGIES', code: 'SGCV', name: 'Saint-Gilles-Croix-de-Vie', type: 'agence', parent_code: '', address: '15 rue des Couvreurs', postal_code: '85800', city: 'SAINT GILLES CROIX DE VIE', phone: '02.51.60.00.00', email: 'stgilles@allez.fr' },
                      { entite: 'ALLEZ ENERGIES', code: 'SGIX', name: 'St Gilles Indus', type: 'centre', parent_code: 'SGCV', address: '', postal_code: '', city: '', phone: '', email: '' },
                      { entite: 'ALLEZ ENERGIES', code: 'SAR', name: 'Sarlat', type: 'centre', parent_code: 'SGCV', address: '', postal_code: '', city: '', phone: '', email: '' },
                      { entite: 'AEB', code: 'AEB01', name: 'Agence Unique AEB', type: 'agence', parent_code: '', address: '5 avenue du Commerce', postal_code: '44100', city: 'NANTES', phone: '02.51.00.00.00', email: 'contact@aeb.fr' }
                    ]}
                    onImport={async (data) => {
                      // Charger toutes les entités
                      const { data: allEntities } = await supabase.from('formia_entities').select('id, name')
                      
                      // Charger toutes les agences existantes pour trouver les parents
                      const { data: existingAgencies } = await supabase.from('formia_agencies').select('id, code')
                      
                      const results = await Promise.allSettled(
                        data.map(async row => {
                          // Trouver l'entité par nom
                          const entity = allEntities.find(e => e.name.toLowerCase() === row.entite?.toLowerCase())
                          if (!entity) {
                            throw new Error(`Entité "${row.entite}" non trouvée`)
                          }
                          
                          // Trouver l'agence parente par code (si type = centre)
                          let parentAgencyId = null
                          if (row.type === 'centre' && row.parent_code) {
                            const parentAgency = existingAgencies.find(a => a.code === row.parent_code)
                            if (parentAgency) {
                              parentAgencyId = parentAgency.id
                            } else {
                              console.warn(`Agence parente avec code "${row.parent_code}" non trouvée pour le centre "${row.name}"`)
                            }
                          }
                          
                          // Créer l'agence ou le centre
                          const { data: newAgency, error: agencyError } = await supabase
                            .from('formia_agencies')
                            .insert({
                              entity_id: entity.id,
                              name: row.name,
                              code: row.code || null,
                              type: row.type || 'agence',
                              parent_agency_id: parentAgencyId,
                              address: row.address || null,
                              postal_code: row.postal_code || null,
                              city: row.city || null,
                              phone: row.phone || null,
                              email: row.email || null
                            })
                            .select()
                            .single()
                          
                          if (agencyError) throw agencyError
                          
                          return newAgency
                        })
                      )
                      
                      const errors = results.filter(r => r.status === 'rejected')
                      if (errors.length > 0) {
                        console.error('Import errors:', errors)
                        throw new Error(`${errors.length} ligne(s) en erreur`)
                      }
                      
                      loadAgencies()
                    }}
                  />
                </div>

                {editingAgency && (
                  <Card className="mb-6 border-red-600">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Nom *</Label>
                          <Input value={editingAgency.name ||''} onChange={(e) => setEditingAgency({...editingAgency, name: e.target.value})} placeholder="Saint-Gilles ou St Gilles Indus" />
                        </div>
                        <div>
                          <Label>Code ERP *</Label>
                          <Input value={editingAgency.code || ''} onChange={(e) => setEditingAgency({...editingAgency, code: e.target.value})} placeholder="SGCV, SGIX, SAR..." />
                        </div>
                        <div>
                          <Label>Type *</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={editingAgency.type || 'agence'}
                            onChange={(e) => setEditingAgency({...editingAgency, type: e.target.value, parent_agency_id: e.target.value === 'agence' ? null : editingAgency.parent_agency_id})}
                          >
                            <option value="agence">Agence</option>
                            <option value="centre">Centre de travaux</option>
                          </select>
                        </div>
                      </div>
                      
                      {editingAgency.type === 'centre' && (
                        <div>
                          <Label>Agence parente</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={editingAgency.parent_agency_id || ''}
                            onChange={(e) => setEditingAgency({...editingAgency, parent_agency_id: e.target.value || null})}
                          >
                            <option value="">-- Aucune --</option>
                            {agencies.filter(a => a.type === 'agence').map(agency => (
                              <option key={agency.id} value={agency.id}>{agency.name} ({agency.code})</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <Label>Adresse</Label>
                        <Input value={editingAgency.address || ''} onChange={(e) => setEditingAgency({...editingAgency, address: e.target.value})} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Code postal</Label>
                          <Input value={editingAgency.postal_code || ''} onChange={(e) => setEditingAgency({...editingAgency, postal_code: e.target.value})} />
                        </div>
                        <div>
                          <Label>Ville</Label>
                          <Input value={editingAgency.city || ''} onChange={(e) => setEditingAgency({...editingAgency, city: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Téléphone</Label>
                          <Input value={editingAgency.phone || ''} onChange={(e) => setEditingAgency({...editingAgency, phone: e.target.value})} />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={editingAgency.email || ''} onChange={(e) => setEditingAgency({...editingAgency, email: e.target.value})} />
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
                  {agencies.map(agency => {
                    const parentAgency = agency.parent_agency_id ? agencies.find(a => a.id === agency.parent_agency_id) : null
                    return (
                      <Card key={agency.id}>
                        <CardContent className="p-4 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{agency.name}</h3>
                              {agency.code && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">{agency.code}</span>}
                              {agency.type && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${agency.type === 'centre' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {agency.type === 'centre' ? 'Centre' : 'Agence'}
                                </span>
                              )}
                            </div>
                            {parentAgency && (
                              <p className="text-sm text-slate-500 mb-1">Rattaché à: {parentAgency.name} ({parentAgency.code})</p>
                            )}
                            {agency.address && <p className="text-sm text-slate-600">{agency.address}, {agency.postal_code} {agency.city}</p>}
                            {(agency.phone || agency.email) && (
                              <p className="text-sm text-slate-600">{agency.phone} {agency.phone && agency.email && '|'} {agency.email}</p>
                            )}
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
                    )
                  })}
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
                {/* Section Import Excel */}
                <div className="mb-8">
                  <ImportExcel
                    title="Import Excel - Chantiers"
                    templateName="template_chantiers"
                    templateColumns={[
                      { key: 'code_chantier', label: 'Code chantier', required: true, example: 'GX265947VEN' },
                      { key: 'client_name', label: 'Nom client', required: true, example: 'Camping Bel Air' },
                      { key: 'address', label: 'Adresse', example: '6 Allée de la chevreuse' },
                      { key: 'postal_code', label: 'Code postal', example: '85180' },
                      { key: 'city', label: 'Ville', example: 'Les sables d\'olonne' },
                      { key: 'responsable_affaire', label: 'Responsable', example: 'Justine Palette' },
                      { key: 'emails', label: 'Emails (séparés par virgule)', example: 'contact1@mail.com, contact2@mail.com' }
                    ]}
                    exampleData={[
                      { code_chantier: 'GX265947VEN', client_name: 'Camping Bel Air', address: '6 Allée de la chevreuse', postal_code: '85180', city: 'Les sables d\'olonne', responsable_affaire: 'Justine Palette', emails: 'justine.palette@example.com' },
                      { code_chantier: 'CH202501', client_name: 'Hôtel Les Sables', address: '12 avenue de la mer', postal_code: '85100', city: 'Les Sables-d\'Olonne', responsable_affaire: 'Pierre Martin', emails: 'p.martin@hotel.fr, contact@hotel.fr' }
                    ]}
                    onImport={async (data) => {
                      const results = await Promise.allSettled(
                        data.map(row => {
                          // Convertir emails en array
                          const emailsArray = typeof row.emails === 'string' 
                            ? row.emails.split(',').map(e => e.trim()).filter(Boolean)
                            : []
                          
                          return supabase.from('formia_chantiers').insert({
                            entity_id: selectedEntity.id,
                            code_chantier: row.code_chantier,
                            client_name: row.client_name,
                            address: row.address || null,
                            postal_code: row.postal_code || null,
                            city: row.city || null,
                            responsable_affaire: row.responsable_affaire || null,
                            emails: emailsArray.length > 0 ? emailsArray : null
                          })
                        })
                      )
                      const errors = results.filter(r => r.status === 'rejected')
                      if (errors.length > 0) {
                        console.error('Import errors:', errors)
                        throw new Error(`${errors.length} ligne(s) en erreur`)
                      }
                      loadChantiers()
                    }}
                  />
                </div>

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

          {/* Tab Utilisateurs */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <Button variant="outline" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un utilisateur (Supabase)
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editingUser && (
                  <Card className="mb-6 border-blue-600">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Prénom *</Label>
                          <Input value={editingUser.prenom || ''} onChange={(e) => setEditingUser({...editingUser, prenom: e.target.value})} />
                        </div>
                        <div>
                          <Label>Nom *</Label>
                          <Input value={editingUser.nom || ''} onChange={(e) => setEditingUser({...editingUser, nom: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <Input value={editingUser.phone || ''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} />
                      </div>
                      <div>
                        <Label>Rôle *</Label>
                        <select 
                          className="w-full p-2 border rounded"
                          value={editingUser.role || 'technicien'}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin_agence">Admin Agence</option>
                          <option value="technicien">Technicien</option>
                        </select>
                      </div>
                      {(editingUser.role === 'admin_agence' || editingUser.role === 'technicien') && (
                        <div>
                          <Label>Entité {editingUser.role === 'admin_agence' && '*'}</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={editingUser.entity_id || ''}
                            onChange={(e) => setEditingUser({...editingUser, entity_id: e.target.value || null})}
                          >
                            <option value="">-- Aucune --</option>
                            {entities.map(entity => (
                              <option key={entity.id} value={entity.id}>{entity.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {editingUser.role === 'technicien' && (
                        <div>
                          <Label>Agence *</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={editingUser.agency_id || ''}
                            onChange={(e) => setEditingUser({...editingUser, agency_id: e.target.value || null})}
                          >
                            <option value="">-- Aucune --</option>
                            {agencies.map(agency => (
                              <option key={agency.id} value={agency.id}>{agency.name} ({agency.code})</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={handleSaveUser}><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                        <Button variant="outline" onClick={() => setEditingUser(null)}><X className="w-4 h-4 mr-2" />Annuler</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {users.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun utilisateur pour le moment</p>
                      <p className="text-sm mt-1">Créez des utilisateurs via Supabase Auth Dashboard</p>
                    </div>
                  )}
                  {users.map(user => (
                    <Card key={user.id}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'admin_agence' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {user.role === 'super_admin' && 'Super Admin'}
                              {user.role === 'admin_agence' && 'Admin Agence'}
                              {user.role === 'technicien' && 'Technicien'}
                            </span>
                          </div>
                          {user.formia_entities && (
                            <p className="text-sm text-slate-500">Entité: {user.formia_entities.name}</p>
                          )}
                          {user.formia_agencies && (
                            <p className="text-sm text-slate-500">Agence: {user.formia_agencies.name} ({user.formia_agencies.code})</p>
                          )}
                          {user.phone && <p className="text-sm text-slate-600">☎️ {user.phone}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
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
