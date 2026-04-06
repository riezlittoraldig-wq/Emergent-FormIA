'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

export function PhotoUpload({ photos = [], onChange, maxPhotos = 4 }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Vous ne pouvez ajouter que ${maxPhotos} photos maximum`)
      return
    }

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))

    onChange([...photos, ...newPhotos])
  }

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onChange(newPhotos)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <Card key={index} className="relative group overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={photo.preview || photo.url} 
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {photos.length < maxPhotos && (
          <Card 
            className="aspect-video border-2 border-dashed hover:border-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Upload className="w-12 h-12 mb-2" />
              <p className="text-sm font-medium">Ajouter une photo</p>
              <p className="text-xs">{photos.length}/{maxPhotos}</p>
            </div>
          </Card>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}
