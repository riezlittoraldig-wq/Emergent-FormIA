'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignaturePad } from './SignaturePad'
import { FileSignature } from 'lucide-react'

export function ObservationsSignaturesSection({ data, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Observations */}
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

      {/* Signatures manuscrites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <SignaturePad
              label="Signature Intervenant"
              value={data.signatureIntervenant || ''}
              onChange={(base64) => updateField('signatureIntervenant', base64)}
            />
            <SignaturePad
              label="Signature Client"
              value={data.signatureClient || ''}
              onChange={(base64) => updateField('signatureClient', base64)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
