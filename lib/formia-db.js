/**
 * formia-db.js
 * Base IndexedDB locale via Dexie — stockage offline des brouillons FormIA
 */
import Dexie from 'dexie'

export const db = new Dexie('FormIA')

db.version(1).stores({
  /**
   * drafts — brouillons locaux
   * localId      : clé primaire auto-incrémentée
   * remoteId     : id Supabase (null si pas encore synchronisé)
   * entityId     : id entité
   * agencyId     : id agence
   * documentNumber
   * clientName
   * status       : 'local' | 'synced' | 'sync_error'
   * formData     : objet JSON complet du formulaire
   * updatedAt    : timestamp local (ms)
   */
  drafts: '++localId, remoteId, entityId, agencyId, status, updatedAt',

  /**
   * syncQueue — actions en attente de sync réseau
   * id           : clé primaire auto
   * type         : 'save_draft' | 'finalize_document'
   * payload      : données à envoyer
   * attempts     : nombre de tentatives
   * createdAt
   */
  syncQueue: '++id, type, createdAt'
})

// ─── Helpers drafts ───────────────────────────────────────────────────────────

export async function saveDraftLocally({ localId, entityId, agencyId, formData }) {
  const record = {
    entityId,
    agencyId,
    documentNumber: formData.documentNumber || String(Date.now()),
    clientName: formData.clientName || '',
    status: 'local',
    formData,
    updatedAt: Date.now()
  }

  if (localId) {
    await db.drafts.update(localId, record)
    return localId
  } else {
    return await db.drafts.add(record)
  }
}

export async function getDraft(localId) {
  return db.drafts.get(localId)
}

export async function listDrafts(entityId) {
  return db.drafts
    .where('entityId').equals(entityId)
    .reverse()
    .sortBy('updatedAt')
}

export async function deleteDraft(localId) {
  return db.drafts.delete(localId)
}

export async function markDraftSynced(localId, remoteId) {
  return db.drafts.update(localId, { remoteId, status: 'synced' })
}

// ─── Helpers syncQueue ────────────────────────────────────────────────────────

export async function enqueue(type, payload) {
  return db.syncQueue.add({ type, payload, attempts: 0, createdAt: Date.now() })
}

export async function getPendingQueue() {
  return db.syncQueue.toArray()
}

export async function removeFromQueue(id) {
  return db.syncQueue.delete(id)
}

export async function incrementAttempts(id) {
  const item = await db.syncQueue.get(id)
  if (item) {
    await db.syncQueue.update(id, { attempts: (item.attempts || 0) + 1 })
  }
}
