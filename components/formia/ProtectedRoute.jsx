'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/formia-auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Ne pas rediriger si on est déjà sur la page de login
    if (!loading && !isAuthenticated && pathname !== '/formia/login') {
      router.push('/formia/login')
    }
  }, [isAuthenticated, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/formia/login') {
    return null // Retourne null pendant la redirection
  }

  return <>{children}</>
}
