'use client'

import { AuthProvider, useAuth } from '@/lib/formia-auth-context'
import { ProtectedRoute } from '@/components/formia/ProtectedRoute'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

function FormIAHeader() {
  const { profile, signOut, isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Ne pas afficher le header sur la page de login
  if (pathname === '/formia/login' || !isAuthenticated) {
    return null
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">FormIA</h1>
          <p className="text-xs text-slate-500">Générateur de formulaires</p>
        </div>

        {profile && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {profile.prenom} {profile.nom}
              </p>
              <p className="text-xs text-slate-500">
                {profile.role === 'super_admin' && 'Super Admin'}
                {profile.role === 'admin_agence' && `Admin - ${profile.formia_entities?.name || ''}`}
                {profile.role === 'technicien' && `Technicien - ${profile.formia_agencies?.name || ''}`}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

function FormIALayoutContent({ children }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/formia/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <FormIAHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function FormIALayout({ children }) {
  return (
    <AuthProvider>
      <FormIALayoutContent>{children}</FormIALayoutContent>
    </AuthProvider>
  )
}
