'use client'

import { useState, useEffect, useCallback } from 'react'
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { syncPendingQueue, registerServiceWorker } from '@/lib/formia-offline'
import { getPendingQueue } from '@/lib/formia-db'
import { useAuth } from '@/lib/formia-auth-context'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncState, setSyncState] = useState('idle') // idle | syncing | done | error
  const [syncResult, setSyncResult] = useState(null)
  const { profile } = useAuth()

  // Enregistrement SW au montage
  useEffect(() => {
    registerServiceWorker()
  }, [])

  // Initialisation état réseau
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsOnline(navigator.onLine)
    refreshPendingCount()
  }, [])

  // Écouteurs réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      refreshPendingCount()
      // Sync automatique au retour en ligne
      handleSync()
    }
    const handleOffline = () => {
      setIsOnline(false)
      setSyncState('idle')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [profile])

  const refreshPendingCount = useCallback(async () => {
    try {
      const queue = await getPendingQueue()
      setPendingCount(queue.length)
    } catch {
      setPendingCount(0)
    }
  }, [])

  const handleSync = useCallback(async () => {
    if (syncState === 'syncing') return
    setSyncState('syncing')
    setSyncResult(null)

    try {
      const result = await syncPendingQueue(profile, () => {})
      setSyncResult(result)
      setSyncState(result.failed > 0 ? 'error' : 'done')
      await refreshPendingCount()

      // Reset après 4 secondes si tout ok
      if (result.failed === 0) {
        setTimeout(() => setSyncState('idle'), 4000)
      }
    } catch (err) {
      setSyncState('error')
      setSyncResult({ synced: 0, failed: 1 })
    }
  }, [syncState, profile, refreshPendingCount])

  // Rien à afficher si en ligne et rien en attente
  if (isOnline && pendingCount === 0 && syncState === 'idle') return null

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all duration-300 ${getBannerStyle(isOnline, syncState)}`}>
      <BannerIcon isOnline={isOnline} syncState={syncState} />
      <span>{getBannerText(isOnline, syncState, pendingCount, syncResult)}</span>

      {isOnline && pendingCount > 0 && syncState !== 'syncing' && (
        <button
          onClick={handleSync}
          className="ml-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-semibold"
        >
          Synchroniser
        </button>
      )}
    </div>
  )
}

function BannerIcon({ isOnline, syncState }) {
  if (!isOnline) return <WifiOff className="w-4 h-4 flex-shrink-0" />
  if (syncState === 'syncing') return <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
  if (syncState === 'done') return <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
  if (syncState === 'error') return <AlertCircle className="w-4 h-4 flex-shrink-0" />
  return <Wifi className="w-4 h-4 flex-shrink-0" />
}

function getBannerStyle(isOnline, syncState) {
  if (!isOnline) return 'bg-slate-800 text-white'
  if (syncState === 'syncing') return 'bg-blue-600 text-white'
  if (syncState === 'done') return 'bg-green-600 text-white'
  if (syncState === 'error') return 'bg-red-600 text-white'
  return 'bg-amber-500 text-white' // en ligne mais éléments en attente
}

function getBannerText(isOnline, syncState, pendingCount, syncResult) {
  if (!isOnline) {
    return pendingCount > 0
      ? `Hors ligne — ${pendingCount} brouillon${pendingCount > 1 ? 's' : ''} en attente`
      : 'Hors ligne — les brouillons sont sauvegardés localement'
  }
  if (syncState === 'syncing') return 'Synchronisation en cours…'
  if (syncState === 'done') return `${syncResult?.synced || 0} brouillon${syncResult?.synced > 1 ? 's' : ''} synchronisé${syncResult?.synced > 1 ? 's' : ''} ✓`
  if (syncState === 'error') return `Synchronisation partielle — ${syncResult?.failed} échec(s)`
  if (pendingCount > 0) return `${pendingCount} brouillon${pendingCount > 1 ? 's' : ''} non synchronisé${pendingCount > 1 ? 's' : ''}`
  return ''
}
