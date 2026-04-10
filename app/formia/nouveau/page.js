'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/formia-auth-context'
import { useSearchParams } from 'next/navigation'
import { MaintenanceHTBTForm } from '@/components/formia/MaintenanceHTBTForm'
import { supabase } from '@/lib/formia-supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, ArrowLeft } from 'lucide-react'

export default function NouveauRapportPage() {
  const { profile } = useAuth()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')
  
  const [loading, setLoading] = useState(true)
  const [entities, setEntities] = useState([])
  const [agencies, setAgencies] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedAgency, setSelectedAgency] = useState(null)
  const [step, setStep] = useState('select-entity')
  const [draftData, setDraftData] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Charger le brouillon si un ID est passé
      if (draftId) {
        const { data: draft, error: draftError } = await supabase
          .from('formia_documents')
          .select('*, formia_entities(*), formia_agencies(*)')
          .eq('id', draftId)
          .single()

        if (draftError) {
          console.error('Error loading draft:', draftError)
        } else if (draft) {
          // Passer directement au formulaire avec les données du brouillon
          setSelectedEntity(draft.formia_entities)
          setSelectedAgency(draft.formia_agencies)
          setDraftData(draft.data_json)
          setStep('form')
          setLoading(false)
          return
        }
      }

      // Chargement normal
      const { data: entitiesData } = await supabase
        .from('formia_entities')
        .select('*')
        .order('name')
      
      setEntities(entitiesData || [])
      
      // Auto-sélectionner ALLEZ ENERGIES si existe
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
    
    const { data: agenciesData } = await supabase
      .from('formia_agencies')
      .select('*')
      .eq('entity_id', entity.id)
      .order('name')
    
    setAgencies(agenciesData || [])
    
    // Si une seule agence, la sélectionner automatiquement
    if (agenciesData && agenciesData.length === 1) {
      setSelectedAgency(agenciesData[0])
      setStep('form')
    } else {
      setStep('select-agency')
    }
  }

  const handleSelectAgency = (agency) => {
    setSelectedAgency(agency)
    setStep('form')
  }

  const handleBack = () => {
    if (step === 'form') {
      setStep('select-agency')
      setSelectedAgency(null)
    } else if (step === 'select-agency') {
      setStep('select-entity')
      setSelectedEntity(null)
      setAgencies([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">
            Nouveau rapport de maintenance
          </h1>
          <p className="text-slate-600">
            Remplissez le formulaire pour générer un rapport professionnel HT/BT
          </p>
        </div>
        
        {/* Sélection entité */}
        {step === 'select-entity' && (
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-slate-900">Sélectionnez une entité</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {entities.map((entity) => (
                  <Card 
                    key={entity.id}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-slate-900"
                    onClick={() => handleSelectEntity(entity)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">{entity.name}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sélection agence */}
        {step === 'select-agency' && (
          <Card>
            <CardContent className="p-8">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <h2 className="text-2xl font-semibold mb-6 text-slate-900">Sélectionnez une agence</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {agencies.map((agency) => (
                  <Card 
                    key={agency.id}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-slate-900"
                    onClick={() => handleSelectAgency(agency)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">{agency.name}</h3>
                          <p className="text-sm text-slate-600">{agency.code}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulaire */}
        {step === 'form' && selectedEntity && selectedAgency && (
          <MaintenanceHTBTForm 
            entity={selectedEntity}
            agency={selectedAgency}
            documentType="maintenance_htbt"
            initialData={draftData}
            draftId={draftId}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}
