'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Composant de protection qui vérifie si l'application est configurée
 * Redirige vers /setup si la configuration n'existe pas
 */
export function ConfigGuard({ children }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const res = await fetch('/api/verify-license')
      const data = await res.json()

      if (!data.configured) {
        // Pas configuré, rediriger vers /setup
        router.replace('/setup')
        return
      }

      if (!data.valid) {
        // Configuré mais licence invalide
        router.replace('/setup')
        return
      }

      // Tout est OK
      setIsConfigured(true)
    } catch (error) {
      console.error('Erreur lors de la vérification de configuration:', error)
      // En cas d'erreur, rediriger vers setup par sécurité
      router.replace('/setup')
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-slate-600">Vérification de la configuration...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return null // La redirection est en cours
  }

  return <>{children}</>
}
