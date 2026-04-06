'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PDFPreview({ formData, entity, documentType, onBack }) {
  const [generating, setGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/formia/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, entity, documentType })
      })

      if (!response.ok) throw new Error('PDF generation failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      
      toast.success('PDF généré avec succès')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `Rapport_${formData.documentNumber}_${formData.clientName}.pdf`
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prévisualisation PDF</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au formulaire
              </Button>
              {!pdfUrl && (
                <Button 
                  onClick={handleGeneratePDF}
                  disabled={generating}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Générer le PDF
                </Button>
              )}
              {pdfUrl && (
                <Button 
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!pdfUrl && !generating && (
            <div className="text-center py-12 text-slate-600">
              <p className="mb-4">Cliquez sur "Générer le PDF" pour créer votre document</p>
              <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Résumé</h3>
                <div className="text-sm text-left space-y-1">
                  <p><span className="font-medium">Client:</span> {formData.clientName}</p>
                  <p><span className="font-medium">N° affaire:</span> {formData.numeroAffaire}</p>
                  <p><span className="font-medium">Intervenant:</span> {formData.intervenant}</p>
                  <p><span className="font-medium">Date:</span> {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          )}

          {generating && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-slate-600">Génération du PDF en cours...</p>
            </div>
          )}

          {pdfUrl && (
            <div className="border rounded-lg overflow-hidden" style={{ height: '800px' }}>
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
