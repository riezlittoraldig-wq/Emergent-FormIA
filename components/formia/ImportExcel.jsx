'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

export function ImportExcel({ 
  title, 
  templateColumns, 
  onImport, 
  templateName,
  exampleData = []
}) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setValidationErrors([])

    try {
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Valider les colonnes
      if (jsonData.length === 0) {
        toast.error('Le fichier est vide')
        return
      }

      const fileColumns = Object.keys(jsonData[0])
      const missingColumns = templateColumns.filter(col => !fileColumns.includes(col.key))

      if (missingColumns.length > 0) {
        setValidationErrors([`Colonnes manquantes: ${missingColumns.map(c => c.label).join(', ')}`])
      }

      setPreview(jsonData.slice(0, 5)) // Preview 5 premières lignes
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('Erreur lors de la lecture du fichier')
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      await onImport(jsonData)
      
      toast.success(`${jsonData.length} ligne(s) importée(s) avec succès`)
      setFile(null)
      setPreview([])
      setValidationErrors([])
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    // Créer un fichier Excel avec les colonnes
    const ws = XLSX.utils.json_to_sheet(exampleData.length > 0 ? exampleData : [
      templateColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.example || '' }), {})
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, `${templateName}.xlsx`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger le template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload zone */}
        {!file && (
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-red-600 hover:bg-red-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="font-medium mb-2">Cliquez pour sélectionner un fichier Excel</p>
            <p className="text-sm text-slate-500">Formats acceptés : .xlsx, .xls</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Preview */}
        {file && preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-slate-500">Aperçu des 5 premières lignes</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setFile(null)
                setPreview([])
                setValidationErrors([])
              }}>
                <XCircle className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Erreurs de validation</p>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      {validationErrors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview table */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {templateColumns.map(col => (
                      <th key={col.key} className="p-2 text-left font-medium">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t">
                      {templateColumns.map(col => (
                        <td key={col.key} className="p-2">
                          {row[col.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Import button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleImport}
                disabled={importing || validationErrors.length > 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {importing ? 'Import en cours...' : 'Importer les données'}
              </Button>
            </div>
          </div>
        )}

        {/* Template info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-900 mb-2">Colonnes requises :</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
            {templateColumns.map(col => (
              <div key={col.key}>
                • {col.label} {col.required && <span className="text-red-600">*</span>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
