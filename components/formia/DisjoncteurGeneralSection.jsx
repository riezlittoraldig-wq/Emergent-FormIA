'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import { useRef } from 'react'

export function DisjoncteurGeneralSection({ data, onChange }) {
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
          <Label htmlFor="djg-marque">Marque</Label>
          <Input 
            id="djg-marque"
            placeholder="Ex: merlin"
            value={data.marque}
            onChange={(e) => updateField('marque', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="djg-type">Type</Label>
          <Input 
            id="djg-type"
            placeholder="Ex: NS 1000 N"
            value={data.type}
            onChange={(e) => updateField('type', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="djg-serie">N° de série</Label>
          <Input 
            id="djg-serie"
            placeholder="Ex: 4TAF0053315"
            value={data.numeroSerie}
            onChange={(e) => updateField('numeroSerie', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="djg-norme">Norme</Label>
          <Input 
            id="djg-norme"
            placeholder="Ex: IEC 60947-2"
            value={data.norme}
            onChange={(e) => updateField('norme', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="djg-famille">Famille déclencheur</Label>
          <Input 
            id="djg-famille"
            placeholder="Ex: micrologic"
            value={data.familleDeclencheur}
            onChange={(e) => updateField('familleDeclencheur', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="djg-type-decl">Type déclencheur</Label>
          <Input 
            id="djg-type-decl"
            placeholder="Ex: 2.0"
            value={data.typeDeclencheur}
            onChange={(e) => updateField('typeDeclencheur', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="djg-coupure">Pouvoir de coupure</Label>
          <Input 
            id="djg-coupure"
            placeholder="Ex: 1000"
            value={data.pouvoirCoupure}
            onChange={(e) => updateField('pouvoirCoupure', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="djg-in">In</Label>
          <Input 
            id="djg-in"
            placeholder="Ex: 1000"
            value={data.in}
            onChange={(e) => updateField('in', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="djg-poles">Nombre de pôles</Label>
          <Input 
            id="djg-poles"
            placeholder="Ex: 3"
            value={data.nombrePoles}
            onChange={(e) => updateField('nombrePoles', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="djg-protection">Param. protection</Label>
          <Input 
            id="djg-protection"
            placeholder="Ex: micrologic"
            value={data.paramProtection}
            onChange={(e) => updateField('paramProtection', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="djg-divers">Divers</Label>
        <Input 
          id="djg-divers"
          placeholder="Informations diverses"
          value={data.divers}
          onChange={(e) => updateField('divers', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Photo</Label>
        {data.photo ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={data.photo.preview || data.photo.url} 
                alt="Disjoncteur général"
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
    </div>
  )
}
