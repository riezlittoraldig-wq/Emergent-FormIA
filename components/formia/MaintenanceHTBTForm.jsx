'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotoUpload } from './PhotoUpload'
import { TransformatorSection } from './TransformatorSection'
import { CelluleProtectionSection } from './CelluleProtectionSection'
import { PDFPreview } from './PDFPreview'
import { supabase } from '@/lib/formia-supabase'
import { Save, FileDown, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function MaintenanceHTBTForm({ entity, documentType, onBack }) {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState({
    // Informations générales
    documentNumber: `${Date.now()}`,
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
    
    // Photos avant intervention
    photosAvant: [],
    
    // Transformateur
    transformateur: {
      marque: '',
      puissance: '',
      annee: '',
      numeroOrigine: '',
      reference: '',
      photo: null
    },
    
    // Cellules protection (array)
    cellulesProtection: [
      { marque: '', type: '', reference: '', designation: '', observations: '', photo: null }
    ]
  })

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const handleGeneratePDF = () => {
    setShowPreview(true)
  }

  const canGeneratePDF = () => {
    return formData.clientName && formData.numeroAffaire && formData.intervenant
  }

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <>
          {/* Actions */}
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="photos">Photos avant</TabsTrigger>
              <TabsTrigger value="transformateur">Transformateur</TabsTrigger>
              <TabsTrigger value="cellules">Cellules protection</TabsTrigger>
            </TabsList>

            {/* Informations générales */}
            <TabsContent value="general">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>Remplissez les informations de base du rapport</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    <Button onClick={() => setActiveTab('photos')}>Suivant: Photos avant</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Photos avant intervention */}
            <TabsContent value="photos">
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

            {/* Transformateur */}
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
                    <Button variant="outline" onClick={() => setActiveTab('photos')}>Précédent</Button>
                    <Button onClick={() => setActiveTab('cellules')}>Suivant: Cellules protection</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cellules protection */}
            <TabsContent value="cellules">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Cellules de protection</CardTitle>
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
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <PDFPreview 
          formData={formData}
          entity={entity}
          documentType={documentType}
          onBack={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
