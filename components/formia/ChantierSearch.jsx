'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, X, Building2, Hash, User } from 'lucide-react'
import { supabase } from '@/lib/formia-supabase'

export function ChantierSearch({ onSelect, entityId, agencyId }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    try {
      let q = supabase
        .from('formia_chantiers')
        .select('*')
        .or(`code_chantier.ilike.%${term}%,client_name.ilike.%${term}%,city.ilike.%${term}%`)
        .limit(8)

      if (entityId) q = q.eq('entity_id', entityId)
      if (agencyId) q = q.eq('agency_id', agencyId)

      const { data, error } = await q
      if (error) throw error

      setResults(data || [])
      setOpen(true)
    } catch (err) {
      console.error('Erreur recherche chantier:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [entityId, agencyId])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 250)
  }

  const handleSelect = (chantier) => {
    setSelected(chantier)
    setQuery('')
    setOpen(false)
    setResults([])
    onSelect(chantier)
  }

  const handleClear = () => {
    setSelected(null)
    setQuery('')
    setResults([])
    onSelect(null)
  }

  const highlight = (text, term) => {
    if (!term || !text) return text
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = String(text).split(regex)
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-100 text-yellow-900 rounded px-0.5 font-semibold not-italic">{part}</mark>
        : part
    )
  }

  if (selected) {
    return (
      <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-green-800">{selected.code_chantier}</span>
              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Chantier sélectionné</Badge>
            </div>
            <p className="font-medium text-slate-800 truncate">{selected.client_name}</p>
            {(selected.address || selected.city) && (
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {[selected.address, selected.postal_code, selected.city].filter(Boolean).join(' ')}
              </p>
            )}
            {selected.responsable_affaire && (
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {selected.responsable_affaire}
              </p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="flex-shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="chantier-search" className="mb-1.5 block">
        Rechercher un chantier
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          id="chantier-search"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Code chantier, nom client ou ville…"
          className="pl-9 pr-4"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-red-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              Aucun chantier trouvé pour « {query} »
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {results.map((chantier) => (
                <li
                  key={chantier.id}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(chantier)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-full bg-red-50 flex items-center justify-center">
                      <Hash className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 text-sm block">
                        {highlight(chantier.code_chantier, query)}
                      </span>
                      <p className="text-sm text-slate-700 font-medium">
                        {highlight(chantier.client_name, query)}
                      </p>
                      {chantier.city && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {highlight([chantier.postal_code, chantier.city].filter(Boolean).join(' '), query)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-1.5">
        Tapez au moins 2 caractères — saisie manuelle possible si aucun résultat
      </p>
    </div>
  )
}
