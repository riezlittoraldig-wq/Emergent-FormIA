'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import { useRef } from 'react'

export function TransformatorSection({ data, onChange }) {
  const photoInputRef = useRef(null)

  const updateField = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      onChange({ ...data, photo: { file, preview, name: file.name } })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="trans-marque">Marque</Label>
          <Input 
            id="trans-marque"
            placeholder="Ex: france transfo"
            value={data.marque}
            onChange={(e) => updateField('marque', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trans-puissance">Puissance</Label>
          <Input 
            id="trans-puissance"
            placeholder="Ex: 630 kva"
            value={data.puissance}
            onChange={(e) => updateField('puissance', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="trans-annee">Année</Label>
          <Input 
            id="trans-annee"
            placeholder="Ex: 2008"
            value={data.annee}
            onChange={(e) => updateField('annee', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trans-numero">N° d'origine</Label>
          <Input 
            id="trans-numero"
            placeholder="Ex: 42619AK-1"
            value={data.numeroOrigine}
            onChange={(e) => updateField('numeroOrigine', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trans-ref">Référence</Label>
        <Input 
          id="trans-ref"
          placeholder="Ex: OTRB-02010G38"
          value={data.reference}
          onChange={(e) => updateField('reference', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Photo de la plaque</Label>
        {data.photo ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={data.photo.preview || data.photo.url} 
                alt="Plaque transformateur"
                className="w-32 h-32 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{data.photo.name}</p>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline mt-1"
                  onClick={() => updateField('photo', null)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card 
            className="p-8 border-2 border-dashed hover:border-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => photoInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center text-slate-400">
              <Upload className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Ajouter une photo de la plaque</p>
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
    </div>
  )
}
