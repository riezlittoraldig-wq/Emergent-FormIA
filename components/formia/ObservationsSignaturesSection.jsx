'use client'

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ObservationsSignaturesSection({ data, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Observations particulières</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Entrez vos observations particulières ici..."
            value={data.observations || ''}
            onChange={(e) => updateField('observations', e.target.value)}
            rows={6}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sig-intervenant">Signature Intervenant</Label>
              <Input 
                id="sig-intervenant"
                placeholder="Nom de l'intervenant"
                value={data.signatureIntervenant || ''}
                onChange={(e) => updateField('signatureIntervenant', e.target.value)}
              />
              <p className="text-xs text-slate-500">Le nom sera affiché dans la section signature du PDF</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sig-client">Signature Client</Label>
              <Input 
                id="sig-client"
                placeholder="Nom du client"
                value={data.signatureClient || ''}
                onChange={(e) => updateField('signatureClient', e.target.value)}
              />
              <p className="text-xs text-slate-500">Le nom sera affiché dans la section signature du PDF</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
