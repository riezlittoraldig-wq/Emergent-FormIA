'use client'

import { AuthProvider, useAuth } from '@/lib/formia-auth-context'
import { ProtectedRoute } from '@/components/formia/ProtectedRoute'
import { ConfigGuard } from '@/components/formia/ConfigGuard'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Settings, Menu } from 'lucide-react'
import { useState } from 'react'

function FormIAHeader() {
  const { user, profile, signOut, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  // Ne pas afficher le header sur la page de login
  if (pathname === '/formia/login' || !isAuthenticated) {
    return null
  }

  // Utiliser les données du profil si disponibles, sinon utiliser user
  const displayName = profile ? `${profile.prenom} ${profile.nom}` : (user?.user_metadata?.prenom || user?.email?.split('@')[0] || 'Utilisateur')
  const initials = profile ? `${profile.prenom?.[0] || ''}${profile.nom?.[0] || ''}` : (user?.user_metadata?.prenom?.[0] || user?.email?.[0] || 'U')
  const role = profile?.role || user?.user_metadata?.role || 'technicien'

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold leading-none">
              <span className="text-slate-900">Form</span>
              <span className="text-red-600">IA</span>
            </h1>
            <p className="text-[10px] text-slate-900 leading-tight mt-0.5">by RLD</p>
          </div>
          <p className="text-xs text-slate-500 hidden md:block ml-2">Générateur de formulaires</p>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* Bouton Admin */}
            {(role === 'super_admin' || role === 'admin_agence') && pathname !== '/formia/admin' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/formia/admin')}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Button>
            )}

            {/* Bouton Formulaire */}
            {pathname !== '/formia' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/formia')}
                className="gap-2"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden md:inline">Formulaire</span>
              </Button>
            )}

            {/* Profil utilisateur */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                  {initials.toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {role === 'super_admin' && 'Super Admin'}
                    {role === 'admin_agence' && 'Admin Agence'}
                    {role === 'technicien' && 'Technicien'}
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                    {/* Infos utilisateur */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {role === 'super_admin' && '🔑 Super Administrateur'}
                        {role === 'admin_agence' && `🏢 Admin - ${profile?.formia_entities?.name || 'Agence'}`}
                        {role === 'technicien' && `⚙️ Technicien - ${profile?.formia_agencies?.name || 'Agence'}`}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push('/formia')
                          setMenuOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Menu className="w-4 h-4" />
                        Formulaire
                      </button>
                      
                      {(role === 'super_admin' || role === 'admin_agence') && (
                        <button
                          onClick={() => {
                            router.push('/formia/admin')
                            setMenuOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Administration
                        </button>
                      )}

                      <button
                        onClick={() => {
                          alert('Page Paramètres à venir')
                          setMenuOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </button>
                    </div>

                    {/* Déconnexion */}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          signOut()
                          setMenuOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => router.push('/formia/login')}
            className="bg-red-600 hover:bg-red-700"
          >
            <User className="w-4 h-4 mr-2" />
            Connexion
          </Button>
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
    <ConfigGuard>
      <AuthProvider>
        <FormIALayoutContent>{children}</FormIALayoutContent>
      </AuthProvider>
    </ConfigGuard>
  )
}
