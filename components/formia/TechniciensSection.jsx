'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Users, Search, X, ChevronDown, Clock } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/formia-supabase'

// Combobox de sélection technicien avec recherche live
function TechnicienCombobox({ value, onChange, availableTechnicians, placeholder = 'Rechercher un technicien…' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedTech = availableTechnicians.find(t => t.user_id === value)

  // Fermer si clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = availableTechnicians.filter(t => {
    if (!query) return true
    const full = `${t.prenom} ${t.nom}`.toLowerCase()
    const agence = t.formia_agencies?.name?.toLowerCase() || ''
    const q = query.toLowerCase()
    return full.includes(q) || agence.includes(q)
  })

  const handleSelect = (tech) => {
    onChange(tech.user_id)
    setOpen(false)
    setQuery('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg bg-white cursor-pointer transition-colors ${
          open ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200 hover:border-slate-300'
        }`}
        onClick={() => setOpen(!open)}
      >
        {selectedTech ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-700">
                {selectedTech.prenom?.[0]}{selectedTech.nom?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-slate-900 text-sm block truncate">
                {selectedTech.prenom} {selectedTech.nom}
              </span>
              {selectedTech.formia_agencies?.name && (
                <span className="text-xs text-slate-400 truncate block">{selectedTech.formia_agencies.name}</span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        )}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selectedTech && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Filtrer par nom ou agence…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100"
              />
            </div>
          </div>

          {/* Liste */}
          <ul className="max-h-56 overflow-y-auto divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">
                Aucun technicien trouvé
              </li>
            ) : (
              filtered.map((tech) => (
                <li
                  key={tech.user_id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(tech)}
                  className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                    tech.user_id === value ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-700">
                      {tech.prenom?.[0]}{tech.nom?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 text-sm block">
                      {tech.prenom} {tech.nom}
                    </span>
                    {tech.formia_agencies?.name && (
                      <span className="text-xs text-slate-400">{tech.formia_agencies.name}</span>
                    )}
                  </div>
                  {tech.user_id === value && (
                    <Badge className="ml-auto bg-red-100 text-red-700 border-red-200 text-xs flex-shrink-0">
                      Sélectionné
                    </Badge>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// Composant principal
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
      console.error('Erreur chargement techniciens:', error)
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
    onChange(autresTechniciens.filter((_, i) => i !== index))
  }

  const updateTechnicien = (index, field, value) => {
    const updated = [...autresTechniciens]

    if (field === 'user_id') {
      const tech = availableTechnicians.find(t => t.user_id === value)
      updated[index] = {
        ...updated[index],
        user_id: value,
        prenom: tech?.prenom || '',
        nom: tech?.nom || ''
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }

    onChange(updated)
  }

  const totalHeures = (
    parseFloat(technicienPrincipal?.temps_intervention || 0) +
    autresTechniciens.reduce((sum, t) => sum + parseFloat(t.temps_intervention || 0), 0)
  )

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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold text-blue-900">Technicien principal</Label>
            <Badge className="bg-blue-600 text-white text-xs">Principal</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Nom complet</Label>
              <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white opacity-75">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">
                    {technicienPrincipal?.prenom?.[0]}{technicienPrincipal?.nom?.[0]}
                  </span>
                </div>
                <span className="text-sm text-slate-700 font-medium">
                  {technicienPrincipal?.prenom} {technicienPrincipal?.nom}
                </span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Temps d'intervention (heures)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Ex: 2.5"
                  className="pl-9"
                  value={technicienPrincipal?.temps_intervention || ''}
                  onChange={(e) => onChange(autresTechniciens, { ...technicienPrincipal, temps_intervention: e.target.value }, true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Techniciens supplémentaires */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Techniciens supplémentaires</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTechnicien}
              disabled={loading}
              className="rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {autresTechniciens.length === 0 && (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun technicien supplémentaire</p>
            </div>
          )}

          <div className="space-y-3">
            {autresTechniciens.map((tech, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">
                    Technicien #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTechnicien(index)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">Technicien *</Label>
                    <TechnicienCombobox
                      value={tech.user_id}
                      onChange={(userId) => updateTechnicien(index, 'user_id', userId)}
                      availableTechnicians={availableTechnicians}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">Temps d'intervention (heures)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Ex: 1.5"
                        className="pl-9"
                        value={tech.temps_intervention || ''}
                        onChange={(e) => updateTechnicien(index, 'temps_intervention', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé temps total */}
        {totalHeures > 0 && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-0.5">Temps total d'intervention</p>
              <p className="text-xs text-slate-400">
                {1 + autresTechniciens.filter(t => t.user_id).length} intervenant(s)
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-900">{totalHeures.toFixed(1)}</span>
              <span className="text-sm text-slate-500 ml-1">h</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
