/**
 * IndexedDB Storage Layer for Umarise v4
 * 
 * Local-first storage for thumbnails and mark metadata.
 * Server only receives hashes - zero image data leaves the device.
 * 
 * Schema:
 * - id: string (page UUID)
 * - thumbnail: Blob (JPEG ~50KB)
 * - hash: string (SHA-256)
 * - originId: string (8-char hex, e.g., "um-a7f3b2c1")
 * - timestamp: Date
 * - otsProof: Uint8Array | null
 * - otsStatus: 'pending' | 'submitted' | 'anchored'
 * - type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch'
 * - sizeClass: 'small' | 'medium' | 'large'
 * - syncStatus: 'synced' | 'queued' | 'failed'
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============= Schema Definition =============

export interface LocalMark {
  id: string;
  thumbnail: Blob | null;
  hash: string;
  originId: string;
  timestamp: Date;
  otsProof: Uint8Array | null;
  otsStatus: 'pending' | 'submitted' | 'anchored';
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  sizeClass: 'small' | 'medium' | 'large';
  syncStatus: 'synced' | 'queued' | 'failed';
  // Legacy fallback - if thumbnail is null, check this URL
  legacyImageUrl?: string;
  // User metadata
  userNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UmariseDB extends DBSchema {
  marks: {
    key: string;
    value: LocalMark;
    indexes: {
      'by-timestamp': Date;
      'by-sync-status': string;
      'by-ots-status': string;
    };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

// ============= Database Instance =============

const DB_NAME = 'umarise-v4';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<UmariseDB>> | null = null;

async function getDB(): Promise<IDBPDatabase<UmariseDB>> {
  if (!dbPromise) {
    dbPromise = openDB<UmariseDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create marks store
        if (!db.objectStoreNames.contains('marks')) {
          const markStore = db.createObjectStore('marks', { keyPath: 'id' });
          markStore.createIndex('by-timestamp', 'timestamp');
          markStore.createIndex('by-sync-status', 'syncStatus');
          markStore.createIndex('by-ots-status', 'otsStatus');
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// ============= Mark Operations =============

/**
 * Save a new mark to IndexedDB
 */
export async function saveMark(mark: Omit<LocalMark, 'createdAt' | 'updatedAt'>): Promise<LocalMark> {
  const db = await getDB();
  const now = new Date();
  
  const fullMark: LocalMark = {
    ...mark,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.put('marks', fullMark);
  console.log('[IndexedDB] Mark saved:', mark.id);
  return fullMark;
}

/**
 * Update an existing mark in IndexedDB (preserves createdAt)
 */
export async function updateMark(mark: LocalMark): Promise<LocalMark> {
  const db = await getDB();
  const updated: LocalMark = {
    ...mark,
    updatedAt: new Date(),
  };
  await db.put('marks', updated);
  console.log('[IndexedDB] Mark updated:', mark.id);
  return updated;
}

/**
 * Get a mark by ID
 */
export async function getMark(id: string): Promise<LocalMark | undefined> {
  const db = await getDB();
  return db.get('marks', id);
}

/**
 * Get all marks, sorted by timestamp descending
 */
export async function getAllMarks(): Promise<LocalMark[]> {
  const db = await getDB();
  const marks = await db.getAllFromIndex('marks', 'by-timestamp');
  // Sort descending (newest first)
  return marks.reverse();
}

/**
 * Update a mark's OTS proof
 */
export async function updateOtsProof(
  id: string,
  otsProof: Uint8Array,
  otsStatus: 'pending' | 'submitted' | 'anchored'
): Promise<boolean> {
  const db = await getDB();
  const mark = await db.get('marks', id);
  
  if (!mark) {
    console.warn('[IndexedDB] Mark not found for OTS update:', id);
    return false;
  }
  
  await db.put('marks', {
    ...mark,
    otsProof,
    otsStatus,
    updatedAt: new Date(),
  });
  
  console.log('[IndexedDB] OTS proof updated:', id, otsStatus);
  return true;
}

/**
 * Update a mark's sync status
 */
export async function updateSyncStatus(
  id: string,
  syncStatus: 'synced' | 'queued' | 'failed'
): Promise<boolean> {
  const db = await getDB();
  const mark = await db.get('marks', id);
  
  if (!mark) return false;
  
  await db.put('marks', {
    ...mark,
    syncStatus,
    updatedAt: new Date(),
  });
  
  return true;
}

/**
 * Get marks that need to be synced
 */
export async function getQueuedMarks(): Promise<LocalMark[]> {
  const db = await getDB();
  return db.getAllFromIndex('marks', 'by-sync-status', 'queued');
}

/**
 * Get marks with pending OTS proofs that need upgrade check
 */
export async function getPendingOtsMarks(): Promise<LocalMark[]> {
  const db = await getDB();
  const pending = await db.getAllFromIndex('marks', 'by-ots-status', 'pending');
  const submitted = await db.getAllFromIndex('marks', 'by-ots-status', 'submitted');
  return [...pending, ...submitted];
}

/**
 * Delete a mark
 */
export async function deleteMark(id: string): Promise<boolean> {
  const db = await getDB();
  await db.delete('marks', id);
  console.log('[IndexedDB] Mark deleted:', id);
  return true;
}

/**
 * Get total mark count
 */
export async function getMarkCount(): Promise<number> {
  const db = await getDB();
  return db.count('marks');
}

// ============= Settings Operations =============

/**
 * Get a setting value
 */
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get('settings', key) as Promise<T | undefined>;
}

/**
 * Set a setting value
 */
export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', value, key);
}

// ============= Migration Helpers =============

/**
 * Import a legacy page from Supabase into IndexedDB
 * Used during the dual-write transition period
 */
export async function importLegacyPage(page: {
  id: string;
  imageUrl: string;
  hash: string;
  createdAt: Date;
}): Promise<LocalMark> {
  const mark: Omit<LocalMark, 'createdAt' | 'updatedAt'> = {
    id: page.id,
    thumbnail: null, // Legacy pages don't have local thumbnails
    hash: page.hash,
    originId: `um-${page.id.substring(0, 8)}`, // Derive from UUID
    timestamp: page.createdAt,
    otsProof: null,
    otsStatus: 'pending',
    type: 'warm', // Default type for legacy
    sizeClass: 'medium',
    syncStatus: 'synced', // Already on server
    legacyImageUrl: page.imageUrl,
  };
  
  return saveMark(mark);
}

// ============= Utility =============

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('marks');
  await db.clear('settings');
  console.log('[IndexedDB] All data cleared');
}
