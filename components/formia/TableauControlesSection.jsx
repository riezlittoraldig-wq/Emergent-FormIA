'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function TableauControlesSection({ titre, controles, data, onChange }) {
  const updateControle = (index, field, value) => {
    const newData = [...data]
    newData[index] = { ...newData[index], [field]: value }
    onChange(newData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{titre}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {controles.map((controle, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`${titre}-${index}-vu`}
                  checked={data[index]?.vu || false}
                  onCheckedChange={(checked) => updateControle(index, 'vu', checked)}
                />
                <Label 
                  htmlFor={`${titre}-${index}-vu`}
                  className="text-sm font-medium cursor-pointer"
                >
                  Vu
                </Label>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">{controle.label}</p>
                <Input 
                  placeholder="Observations"
                  value={data[index]?.observations || ''}
                  onChange={(e) => updateControle(index, 'observations', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
