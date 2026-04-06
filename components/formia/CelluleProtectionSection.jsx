'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'

export function CelluleProtectionSection({ cellules, onAdd, onUpdate, onRemove }) {
  return (
    <div className="space-y-6">
      {cellules.map((cellule, index) => (
        <CelluleCard
          key={index}
          index={index}
          data={cellule}
          onUpdate={onUpdate}
          onRemove={cellules.length > 1 ? onRemove : null}
        />
      ))}

      <Button 
        type="button"
        variant="outline" 
        onClick={onAdd}
        className="w-full border-2 border-dashed hover:border-red-600 hover:bg-red-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une cellule de protection
      </Button>
    </div>
  )
}

function CelluleCard({ index, data, onUpdate, onRemove }) {
  const photoInputRef = useRef(null)

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      onUpdate(index, 'photo', { file, preview, name: file.name })
    }
  }

  return (
    <Card className="relative">
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
      
      <CardHeader>
        <CardTitle className="text-lg">Cellule {index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Marque</Label>
            <Input 
              placeholder="Ex: merlin"
              value={data.marque}
              onChange={(e) => onUpdate(index, 'marque', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Input 
              placeholder="Ex: IM"
              value={data.type}
              onChange={(e) => onUpdate(index, 'type', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Référence</Label>
            <Input 
              placeholder="Ex: 0804181M"
              value={data.reference}
              onChange={(e) => onUpdate(index, 'reference', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Désignation</Label>
            <Input 
              placeholder="Ex: camping bel air"
              value={data.designation}
              onChange={(e) => onUpdate(index, 'designation', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observations</Label>
          <Textarea 
            placeholder="Notes ou observations..."
            value={data.observations}
            onChange={(e) => onUpdate(index, 'observations', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Photo</Label>
          {data.photo ? (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={data.photo.preview || data.photo.url} 
                  alt="Cellule protection"
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{data.photo.name}</p>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline mt-1"
                    onClick={() => onUpdate(index, 'photo', null)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <Card 
              className="p-6 border-2 border-dashed hover:border-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              onClick={() => photoInputRef.current?.click()}
            >
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Upload className="w-5 h-5" />
                <p className="text-sm font-medium">Ajouter une photo</p>
              </div>
            </Card>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>
      </CardContent>
    </Card>
  )
}
