'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaintenanceHTBTForm } from '@/components/formia/MaintenanceHTBTForm'
import { supabase } from '@/lib/formia-supabase'
import { FileText, Building2, Loader2 } from 'lucide-react'

export default function FormIAPage() {
  const [entities, setEntities] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [agencies, setAgencies] = useState([])
  const [selectedAgency, setSelectedAgency] = useState(null)
  const [documentTypes, setDocumentTypes] = useState([])
  const [selectedDocType, setSelectedDocType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('select-entity')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: entitiesData } = await supabase
        .from('formia_entities')
        .select('*')
        .order('name')
      
      const { data: docTypesData } = await supabase
        .from('formia_document_types')
        .select('*')
        .order('name')
      
      setEntities(entitiesData || [])
      setDocumentTypes(docTypesData || [])
      
      // Auto-select ALLEZ ENERGIES if exists
      const allezEnergies = entitiesData?.find(e => e.name === 'ALLEZ ENERGIES')
      if (allezEnergies) {
        await handleSelectEntity(allezEnergies)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEntity = async (entity) => {
    setSelectedEntity(entity)
    setSelectedAgency(null)
    await loadAgencies(entity.id)
  }

  const loadAgencies = async (entityId) => {
    try {
      const { data } = await supabase
        .from('formia_agencies')
        .select('*')
        .eq('entity_id', entityId)
        .order('name')
      
      setAgencies(data || [])
      if (data && data.length > 0) {
        setStep('select-agency')
      } else {
        setStep('select-type')
      }
    } catch (error) {
      console.error('Error loading agencies:', error)
      setStep('select-type')
    }
  }

  const handleSelectDocType = (docType) => {
    setSelectedDocType(docType)
    setStep('form')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">FormIA</h1>
          <p className="text-slate-600 text-lg">Générateur de formulaires professionnels</p>
        </div>

        {step === 'select-entity' && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="w-6 h-6 text-red-600" />
                  Sélectionnez une entité
                </CardTitle>
                <CardDescription>Choisissez l'entité pour laquelle vous souhaitez générer un document</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {entities.map(entity => (
                    <Card 
                      key={entity.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-red-600"
                      onClick={() => handleSelectEntity(entity)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          {entity.logo_url && (
                            <img 
                              src={entity.logo_url} 
                              alt={entity.name} 
                              className="h-16 w-auto object-contain"
                              style={{ maxWidth: '200px' }}
                            />
                          )}
                          {!entity.logo_url && (
                            <div>
                              <h3 className="font-semibold text-lg">{entity.name}</h3>
                              {entity.contact_info?.group && (
                                <p className="text-sm text-slate-600">{entity.contact_info.group}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'select-agency' && selectedEntity && agencies.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Building2 className="w-6 h-6 text-red-600" />
                      Sélectionnez une agence
                    </CardTitle>
                    <CardDescription>Entité: {selectedEntity.name}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSelectedEntity(null)
                    setSelectedAgency(null)
                    setAgencies([])
                    setStep('select-entity')
                  }}>Changer d'entité</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {agencies.map(agency => (
                    <Card 
                      key={agency.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-red-600"
                      onClick={() => {
                        setSelectedAgency(agency)
                        setStep('select-type')
                      }}
                    >
                      <CardContent className="p-6">
                        <div>
                          <h3 className="font-semibold text-lg">{agency.name}</h3>
                          {agency.code && (
                            <p className="text-sm text-slate-600">Code: {agency.code}</p>
                          )}
                          {agency.address && (
                            <p className="text-sm text-slate-600">
                              {agency.address}, {agency.postal_code} {agency.city}
                            </p>
                          )}
                          {agency.phone && (
                            <p className="text-sm text-slate-600">Tél: {agency.phone}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'select-type' && selectedEntity && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <FileText className="w-6 h-6 text-red-600" />
                      Type de document
                    </CardTitle>
                    <CardDescription>
                      {selectedEntity.name}
                      {selectedAgency && ` - ${selectedAgency.name}`}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSelectedEntity(null)
                    setSelectedAgency(null)
                    setAgencies([])
                    setStep('select-entity')
                  }}>Changer d'entité</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {documentTypes.map(docType => (
                    <Card 
                      key={docType.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-red-600"
                      onClick={() => handleSelectDocType(docType)}
                    >
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-1">{docType.name}</h3>
                        {docType.description && (
                          <p className="text-sm text-slate-600">{docType.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'form' && selectedEntity && selectedDocType && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedDocType.name}</h2>
                <p className="text-sm text-slate-600">{selectedEntity.name}</p>
              </div>
              <Button variant="outline" onClick={() => setStep('select-type')}>Retour</Button>
            </div>
            
            {selectedDocType.slug === 'maintenance-ht-bt' && (
              <MaintenanceHTBTForm 
                entity={selectedEntity}
                agency={selectedAgency}
                documentType={selectedDocType}
                onBack={() => setStep('select-type')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
