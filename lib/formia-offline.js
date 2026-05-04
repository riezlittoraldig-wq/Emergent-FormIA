/**
 * formia-offline.js
 * Logique de synchronisation offline → Supabase
 */
'use client'

import {
  db,
  getPendingQueue,
  removeFromQueue,
  incrementAttempts,
  markDraftSynced
} from './formia-db'
import { supabase } from './formia-supabase'

const MAX_ATTEMPTS = 5

/**
 * Lance la synchronisation de la queue locale vers Supabase.
 * Appelé automatiquement au retour en ligne.
 * Retourne { synced, failed }
 */
export async function syncPendingQueue(profile, onProgress) {
  const queue = await getPendingQueue()
  if (queue.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const item of queue) {
    if (item.attempts >= MAX_ATTEMPTS) {
      failed++
      continue
    }

    try {
      if (item.type === 'save_draft') {
        await syncDraft(item, profile)
        await removeFromQueue(item.id)
        synced++
      }
    } catch (err) {
      console.warn(`[FormIA Sync] Échec item ${item.id}:`, err.message)
      await incrementAttempts(item.id)
      failed++
    }

    onProgress?.({ synced, failed, total: queue.length })
  }

  return { synced, failed }
}

async function syncDraft(item, profile) {
  const { localId, entityId, agencyId, formData, documentNumber, clientName } = item.payload

  const docData = {
    document_number: documentNumber || formData.documentNumber,
    entity_id: entityId,
    agency_id: agencyId,
    document_type: 'maintenance_htbt',
    client_name: clientName || formData.clientName,
    data_json: formData,
    status: 'draft',
    created_by: profile?.user_id
  }

  const { data, error } = await supabase
    .from('formia_documents')
    .insert(docData)
    .select()
    .single()

  if (error) throw error

  // Marquer comme synchronisé dans IndexedDB
  if (localId) {
    await markDraftSynced(localId, data.id)
  }
}

/**
 * Hook léger — retourne l'état réseau courant (côté client seulement)
 */
export function getNetworkStatus() {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

/**
 * Enregistrement du Service Worker
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    console.log('[FormIA SW] Enregistré:', reg.scope)
    return reg
  } catch (err) {
    console.warn('[FormIA SW] Échec enregistrement:', err)
  }
}
