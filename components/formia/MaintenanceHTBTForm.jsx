'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotoUpload } from './PhotoUpload'
import { TransformatorSection } from './TransformatorSection'
import { CelluleProtectionSection } from './CelluleProtectionSection'
import { DisjoncteurGeneralSection } from './DisjoncteurGeneralSection'
import { TableauControlesSection } from './TableauControlesSection'
import { ObservationsSignaturesSection } from './ObservationsSignaturesSection'
import { TechniciensSection } from './TechniciensSection'
import { ChantierSearch } from './ChantierSearch'
import { PDFPreview } from './PDFPreview'
import { supabase } from '@/lib/formia-supabase'
import { useAuth } from '@/lib/formia-auth-context'
import { TABLEAUX_CONTROLES } from '@/lib/formia-config'
import { Save, FileDown, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function MaintenanceHTBTForm({ entity, agency, documentType, initialData, draftId, onBack }) {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { user, profile } = useAuth()
  
  // Initialiser avec les données du brouillon si disponibles
  const getInitialFormData = () => {
    if (initialData) {
      return initialData
    }
    
    return {
      documentNumber: `${Date.now()}`,
    codeChantier: '',
    clientName: '',
    numeroAffaire: '',
    date: new Date().toISOString().split('T')[0],
    intervenant: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    postalCode: '',
    city: '',
    responsableAffaire: '',
    emailsDestinataires: [],
    photosAvant: [],
    transformateur: {
      marque: '',
      puissance: '',
      annee: '',
      numeroOrigine: '',
      reference: '',
      photo: null
    },
    cellulesProtection: [
      { marque: '', type: '', reference: '', designation: '', observations: '', photo: null }
    ],
    disjoncteurGeneral: {
      marque: '',
      type: '',
      numeroSerie: '',
      norme: '',
      familleDeclencheur: '',
      typeDeclencheur: '',
      pouvoirCoupure: '',
      in: '',
      nombrePoles: '',
      paramProtection: '',
      divers: '',
      photo: null
    },
    controlesAccessoires: TABLEAUX_CONTROLES.accessoiresSecurite.controles.map((c) => ({ label: c, vu: false, observations: '' })),
    controlesDisjoncteurBT: TABLEAUX_CONTROLES.disjoncteurBT.controles.map((c) => ({ label: c, vu: false, observations: '' })),
    controlesCellulesHTA: TABLEAUX_CONTROLES.cellulesHTA.controles.map((c) => ({ label: c, vu: false, observations: '' })),
    controlesTransformateur: TABLEAUX_CONTROLES.transformateur.controles.map((c) => ({ label: c, vu: false, observations: '' })),
    controlesLocalPoste: TABLEAUX_CONTROLES.localPoste.controles.map((c) => ({ label: c, vu: false, observations: '' })),
    photosApres: [],
    observationsSignatures: {
      observations: '',
      signatureIntervenant: '',
      signatureClient: ''
    },
    technicienPrincipal: {
      user_id: user?.id || '',
      prenom: profile?.prenom || '',
      nom: profile?.nom || '',
      temps_intervention: ''
    },
    autresTechniciens: []
  }
}

const [formData, setFormData] = useState(getInitialFormData())

// Mettre à jour le technicien principal quand le profil est chargé (sauf si brouillon)
useEffect(() => {
  if (profile && user && !initialData) {
      setFormData(prev => ({
        ...prev,
        technicienPrincipal: {
          user_id: user.id,
          prenom: profile.prenom,
          nom: profile.nom,
          temps_intervention: prev.technicienPrincipal.temps_intervention || ''
        }
      }))
    }
  }, [profile, user])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleChantierSelect = (chantier) => {
    if (chantier) {
      setFormData(prev => ({
        ...prev,
        codeChantier: chantier.code_chantier,
        clientName: chantier.client_name,
        numeroAffaire: chantier.code_chantier,
        address: chantier.address,
        postalCode: chantier.postal_code,
        city: chantier.city,
        responsableAffaire: chantier.responsable_affaire || '',
        emailsDestinataires: chantier.emails || []
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        codeChantier: '',
        responsableAffaire: '',
        emailsDestinataires: []
      }))
    }
  }

  const addCelluleProtection = () => {
    setFormData(prev => ({
      ...prev,
      cellulesProtection: [
        ...prev.cellulesProtection,
        { marque: '', type: '', reference: '', designation: '', observations: '', photo: null }
      ]
    }))
  }

  const updateCelluleProtection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cellulesProtection: prev.cellulesProtection.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }))
  }

  const removeCelluleProtection = (index) => {
    setFormData(prev => ({
      ...prev,
      cellulesProtection: prev.cellulesProtection.filter((_, i) => i !== index)
    }))
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('formia_documents')
        .insert({
          entity_id: entity.id,
          document_type_id: documentType.id,
          document_number: formData.documentNumber,
          client_name: formData.clientName,
          data_json: formData,
          status: 'draft'
        })
        .select()
        .single()
      
      if (error) throw error
      
      toast.success('Brouillon enregistré avec succès')
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleTechniciensChange = (autresTechniciens, technicienPrincipal, isPrincipal = false) => {
    if (isPrincipal) {
      setFormData({ ...formData, technicienPrincipal })
    } else {
      setFormData({ ...formData, autresTechniciens })
    }
  }

  const saveDraft = async () => {
    setSaving(true)
    try {
      const docData = {
        document_number: formData.documentNumber,
        entity_id: entity.id,
        agency_id: agency.id,
        document_type: 'maintenance_htbt',
        client_name: formData.clientName,
        data_json: formData,
        status: 'draft',
        created_by: profile?.user_id || user?.id
      }

      const { data, error } = await supabase
        .from('formia_documents')
        .insert(docData)
        .select()
        .single()

      if (error) {
        console.error('Error saving draft:', error)
        throw error
      }

      toast.success('✅ Brouillon enregistré avec succès !')
      console.log('Draft saved:', data)
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error(`❌ Erreur : ${error.message || 'Impossible d\'enregistrer'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleGeneratePDF = () => {
    setShowPreview(true)
  }

  const canGeneratePDF = () => {
    return formData.clientName && formData.numeroAffaire && formData.intervenant
  }

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'techniciens', label: 'Techniciens' },
    { id: 'photos-avant', label: 'Photos avant' },
    { id: 'transformateur', label: 'Transformateur' },
    { id: 'cellules', label: 'Cellules HT' },
    { id: 'disjoncteur', label: 'Disjoncteur BT' },
    { id: 'controles', label: 'Contrôles' },
    { id: 'photos-apres', label: 'Photos après' },
    { id: 'observations', label: 'Observations' }
  ]

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <>
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveDraft}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer le brouillon
                  </Button>
                </div>
                <Button 
                  onClick={handleGeneratePDF}
                  disabled={!canGeneratePDF()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Prévisualiser le PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 mb-6">
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>

            {/* Onglet 1: Informations générales */}
            <TabsContent value="general">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>Remplissez les informations de base du rapport</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recherche de chantier pour auto-remplissage */}
                  <div className="border-b pb-6">
                    <h3 className="font-semibold mb-4 text-lg">Rechercher un chantier (optionnel)</h3>
                    <ChantierSearch 
                      onSelect={handleChantierSelect}
                      entityId={entity.id}
                      agencyId={agency?.id}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Sélectionnez un chantier existant pour remplir automatiquement les informations, ou saisissez-les manuellement ci-dessous.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nom du client/site *</Label>
                      <Input 
                        id="clientName"
                        placeholder="Ex: camping bel air"
                        value={formData.clientName}
                        onChange={(e) => updateFormData('clientName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numeroAffaire">N° d'affaire *</Label>
                      <Input 
                        id="numeroAffaire"
                        placeholder="Ex: GX265947VEN"
                        value={formData.numeroAffaire}
                        onChange={(e) => updateFormData('numeroAffaire', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => updateFormData('date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intervenant">Intervenant *</Label>
                      <Input 
                        id="intervenant"
                        placeholder="Ex: Stéphane LAUNAY"
                        value={formData.intervenant}
                        onChange={(e) => updateFormData('intervenant', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-semibold mb-4 text-lg">Contact sur site</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Nom</Label>
                        <Input 
                          id="contactName"
                          placeholder="Ex: Justine Palette"
                          value={formData.contactName}
                          onChange={(e) => updateFormData('contactName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Téléphone</Label>
                        <Input 
                          id="contactPhone"
                          placeholder="Ex: 0682041316"
                          value={formData.contactPhone}
                          onChange={(e) => updateFormData('contactPhone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input 
                          id="contactEmail"
                          type="email"
                          placeholder="contact@example.com"
                          value={formData.contactEmail}
                          onChange={(e) => updateFormData('contactEmail', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-semibold mb-4 text-lg">Adresse</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input 
                          id="address"
                          placeholder="Ex: 6 Allée de la chevreuse"
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Code postal</Label>
                          <Input 
                            id="postalCode"
                            placeholder="Ex: 85180"
                            value={formData.postalCode}
                            onChange={(e) => updateFormData('postalCode', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Ville</Label>
                          <Input 
                            id="city"
                            placeholder="Ex: Les sables d'olonne"
                            value={formData.city}
                            onChange={(e) => updateFormData('city', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setActiveTab('photos-avant')}>Suivant: Photos avant</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


            {/* Onglet Techniciens */}
            <TabsContent value="techniciens">
              <TechniciensSection
                technicienPrincipal={formData.technicienPrincipal}
                autresTechniciens={formData.autresTechniciens}
                onChange={handleTechniciensChange}
              />
            </TabsContent>

            {/* Onglet 2: Photos avant */}
            <TabsContent value="photos-avant">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Photos avant intervention</CardTitle>
                  <CardDescription>Ajoutez jusqu'à 4 photos de l'état avant intervention</CardDescription>
                </CardHeader>
                <CardContent>
                  <PhotoUpload 
                    photos={formData.photosAvant}
                    onChange={(photos) => updateFormData('photosAvant', photos)}
                    maxPhotos={4}
                  />
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setActiveTab('general')}>Précédent</Button>
                    <Button onClick={() => setActiveTab('transformateur')}>Suivant: Transformateur</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet 3: Transformateur */}
            <TabsContent value="transformateur">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Transformateur</CardTitle>
                  <CardDescription>Informations techniques du transformateur</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransformatorSection 
                    data={formData.transformateur}
                    onChange={(data) => updateFormData('transformateur', data)}
                  />
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setActiveTab('photos-avant')}>Précédent</Button>
                    <Button onClick={() => setActiveTab('cellules')}>Suivant: Cellules HT</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet 4: Cellules protection */}
            <TabsContent value="cellules">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Cellules de protection HT</CardTitle>
                  <CardDescription>Ajoutez les cellules de protection inspectées</CardDescription>
                </CardHeader>
                <CardContent>
                  <CelluleProtectionSection 
                    cellules={formData.cellulesProtection}
                    onAdd={addCelluleProtection}
                    onUpdate={updateCelluleProtection}
                    onRemove={removeCelluleProtection}
                  />
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setActiveTab('transformateur')}>Précédent</Button>
                    <Button onClick={() => setActiveTab('disjoncteur')}>Suivant: Disjoncteur BT</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet 5: Disjoncteur général BT */}
            <TabsContent value="disjoncteur">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Disjoncteur général basse tension</CardTitle>
                  <CardDescription>Caractéristiques du disjoncteur général</CardDescription>
                </CardHeader>
                <CardContent>
                  <DisjoncteurGeneralSection 
                    data={formData.disjoncteurGeneral}
                    onChange={(data) => updateFormData('disjoncteurGeneral', data)}
                  />
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setActiveTab('cellules')}>Précédent</Button>
                    <Button onClick={() => setActiveTab('controles')}>Suivant: Contrôles</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet 6: Tableaux de contrôles */}
            <TabsContent value="controles">
              <div className="space-y-6">
                <TableauControlesSection 
                  titre={TABLEAUX_CONTROLES.accessoiresSecurite.titre}
                  controles={TABLEAUX_CONTROLES.accessoiresSecurite.controles}
                  data={formData.controlesAccessoires}
                  onChange={(data) => updateFormData('controlesAccessoires', data)}
                />
                <TableauControlesSection 
                  titre={TABLEAUX_CONTROLES.disjoncteurBT.titre}
                  controles={TABLEAUX_CONTROLES.disjoncteurBT.controles}
                  data={formData.controlesDisjoncteurBT}
                  onChange={(data) => updateFormData('controlesDisjoncteurBT', data)}
                />
                <TableauControlesSection 
                  titre={TABLEAUX_CONTROLES.cellulesHTA.titre}
                  controles={TABLEAUX_CONTROLES.cellulesHTA.controles}
                  data={formData.controlesCellulesHTA}
                  onChange={(data) => updateFormData('controlesCellulesHTA', data)}
                />
                <TableauControlesSection 
                  titre={TABLEAUX_CONTROLES.transformateur.titre}
                  controles={TABLEAUX_CONTROLES.transformateur.controles}
                  data={formData.controlesTransformateur}
                  onChange={(data) => updateFormData('controlesTransformateur', data)}
                />
                <TableauControlesSection 
                  titre={TABLEAUX_CONTROLES.localPoste.titre}
                  controles={TABLEAUX_CONTROLES.localPoste.controles}
                  data={formData.controlesLocalPoste}
                  onChange={(data) => updateFormData('controlesLocalPoste', data)}
                />
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setActiveTab('disjoncteur')}>Précédent</Button>
                  <Button onClick={() => setActiveTab('photos-apres')}>Suivant: Photos après</Button>
                </div>
              </div>
            </TabsContent>

            {/* Onglet 7: Photos après */}
            <TabsContent value="photos-apres">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Photos après intervention</CardTitle>
                  <CardDescription>Ajoutez jusqu'à 4 photos de l'état après intervention</CardDescription>
                </CardHeader>
                <CardContent>
                  <PhotoUpload 
                    photos={formData.photosApres}
                    onChange={(photos) => updateFormData('photosApres', photos)}
                    maxPhotos={4}
                  />
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setActiveTab('controles')}>Précédent</Button>
                    <Button onClick={() => setActiveTab('observations')}>Suivant: Observations</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet 8: Observations et signatures */}
            <TabsContent value="observations">
              <div className="space-y-6">
                <ObservationsSignaturesSection 
                  data={formData.observationsSignatures}
                  onChange={(data) => updateFormData('observationsSignatures', data)}
                />
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setActiveTab('photos-apres')}>Précédent</Button>
                  <div className="flex gap-3">
                    <Button 
                      onClick={saveDraft}
                      disabled={saving || !formData.clientName}
                      variant="outline"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Enregistrer brouillon
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleGeneratePDF}
                      disabled={!canGeneratePDF()}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Prévisualiser le PDF
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <PDFPreview 
          formData={formData}
          entity={entity}
          agency={agency}
          documentType={documentType}
          onBack={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
