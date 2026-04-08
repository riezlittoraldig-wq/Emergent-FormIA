'use client'

import { MaintenanceHTBTForm } from '@/components/formia/MaintenanceHTBTForm'

export default function NouveauRapportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">
            Nouveau rapport de maintenance
          </h1>
          <p className="text-slate-600">
            Remplissez le formulaire pour générer un rapport professionnel HT/BT
          </p>
        </div>
        
        <MaintenanceHTBTForm />
      </div>
    </div>
  )
}
