'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/formia-supabase'

export function TechniciensSection({ technicienPrincipal, autresTechniciens, onChange }) {
  const [availableTechnicians, setAvailableTechnicians] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTechnicians()
  }, [])

  const loadTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('formia_user_profiles')
        .select('user_id, prenom, nom, formia_agencies(name, code)')
        .eq('role', 'technicien')
        .order('nom')

      if (error) throw error
      setAvailableTechnicians(data || [])
    } catch (error) {
      console.error('Error loading technicians:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTechnicien = () => {
    onChange([
      ...autresTechniciens,
      { user_id: '', prenom: '', nom: '', temps_intervention: '' }
    ])
  }

  const removeTechnicien = (index) => {
    const newTechniciens = autresTechniciens.filter((_, i) => i !== index)
    onChange(newTechniciens)
  }

  const updateTechnicien = (index, field, value) => {
    const newTechniciens = [...autresTechniciens]
    
    if (field === 'user_id') {
      const selectedTech = availableTechnicians.find(t => t.user_id === value)
      if (selectedTech) {
        newTechniciens[index] = {
          ...newTechniciens[index],
          user_id: value,
          prenom: selectedTech.prenom,
          nom: selectedTech.nom
        }
      }
    } else {
      newTechniciens[index] = { ...newTechniciens[index], [field]: value }
    }
    
    onChange(newTechniciens)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Techniciens intervenants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technicien principal */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold text-blue-900">Technicien principal</Label>
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">Principal</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nom complet</Label>
              <Input 
                value={`${technicienPrincipal.prenom || ''} ${technicienPrincipal.nom || ''}`}
                disabled
                className="bg-white"
              />
            </div>
            <div>
              <Label>Temps d'intervention (heures)</Label>
              <Input 
                type="number"
                step="0.5"
                placeholder="Ex: 2.5"
                value={technicienPrincipal.temps_intervention || ''}
                onChange={(e) => onChange(autresTechniciens, { ...technicienPrincipal, temps_intervention: e.target.value }, true)}
              />
            </div>
          </div>
        </div>

        {/* Autres techniciens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Techniciens supplémentaires</Label>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={addTechnicien}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un technicien
            </Button>
          </div>

          {autresTechniciens.length === 0 && (
            <div className="text-center py-6 text-slate-500 border-2 border-dashed rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun technicien supplémentaire</p>
            </div>
          )}

          <div className="space-y-3">
            {autresTechniciens.map((tech, index) => (
              <div key={index} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Technicien #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTechnicien(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Technicien *</Label>
                    <select
                      className="w-full p-2 border rounded bg-white"
                      value={tech.user_id || ''}
                      onChange={(e) => updateTechnicien(index, 'user_id', e.target.value)}
                    >
                      <option value="">-- Sélectionner --</option>
                      {availableTechnicians.map(t => (
                        <option key={t.user_id} value={t.user_id}>
                          {t.prenom} {t.nom} {t.formia_agencies && `(${t.formia_agencies.name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Temps d'intervention (heures)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="Ex: 2.5"
                      value={tech.temps_intervention || ''}
                      onChange={(e) => updateTechnicien(index, 'temps_intervention', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé */}
        {(technicienPrincipal.temps_intervention || autresTechniciens.some(t => t.temps_intervention)) && (
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
            <Label className="text-base font-semibold mb-2 block">Résumé temps total</Label>
            <div className="text-2xl font-bold text-slate-900">
              {(
                parseFloat(technicienPrincipal.temps_intervention || 0) +
                autresTechniciens.reduce((sum, t) => sum + parseFloat(t.temps_intervention || 0), 0)
              ).toFixed(1)} heures
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {1 + autresTechniciens.filter(t => t.user_id).length} intervenant(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
