'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/formia-supabase'

export function ChantierSearch({ onSelect, entityId, agencyId }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedChantier, setSelectedChantier] = useState(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    try {
      let query = supabase
        .from('formia_chantiers')
        .select('*')
        .eq('entity_id', entityId)
        .or(`code_chantier.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`)
        .limit(10)
      
      if (agencyId) {
        query = query.eq('agency_id', agencyId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Error searching chantiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChantier = (chantier) => {
    setSelectedChantier(chantier)
    onSelect(chantier)
    setResults([])
    setSearchTerm('')
  }

  const handleClear = () => {
    setSelectedChantier(null)
    onSelect(null)
  }

  return (
    <div className="space-y-4">
      {!selectedChantier ? (
        <>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-chantier">Code chantier ou nom client</Label>
              <Input
                id="search-chantier"
                placeholder="Ex: GX265947VEN ou Camping Bel Air"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">{results.length} résultat(s) trouvé(s)</p>
              {results.map((chantier) => (
                <Card 
                  key={chantier.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-red-600"
                  onClick={() => handleSelectChantier(chantier)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{chantier.code_chantier}</p>
                        <p className="text-slate-600">{chantier.client_name}</p>
                        <p className="text-sm text-slate-500">
                          {chantier.address}, {chantier.postal_code} {chantier.city}
                        </p>
                        {chantier.responsable_affaire && (
                          <p className="text-sm text-slate-500">
                            Responsable: {chantier.responsable_affaire}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchTerm && results.length === 0 && !loading && (
            <p className="text-sm text-slate-500">Aucun chantier trouvé. Les informations seront saisies manuellement.</p>
          )}
        </>
      ) : (
        <Card className="border-2 border-green-600">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg text-green-600">✓ Chantier sélectionné</p>
                <p className="font-semibold">{selectedChantier.code_chantier}</p>
                <p className="text-slate-600">{selectedChantier.client_name}</p>
                <p className="text-sm text-slate-500">
                  {selectedChantier.address}, {selectedChantier.postal_code} {selectedChantier.city}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
