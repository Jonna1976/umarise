/**
 * Ephemeral artifact cache using IndexedDB.
 * Stores the confirmed original file per proof token so it survives
 * page refreshes within the same browser session. 
 * Files are stored temporarily — cleared on explicit call or naturally
 * when the user closes the browser.
 */

const DB_NAME = 'itexisted_artifacts';
const STORE_NAME = 'files';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheArtifact(token: string, file: File): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    // Store as { name, type, bytes } since File objects aren't cloneable across sessions
    const bytes = await file.arrayBuffer();
    tx.objectStore(STORE_NAME).put({ name: file.name, type: file.type, bytes }, token);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    db.close();
  } catch (e) {
    console.warn('[artifactCache] store failed:', e);
  }
}

export async function loadArtifact(token: string): Promise<File | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(token);
    const result = await new Promise<any>((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
    db.close();
    if (!result) return null;
    return new File([result.bytes], result.name, { type: result.type });
  } catch (e) {
    console.warn('[artifactCache] load failed:', e);
    return null;
  }
}

export async function clearArtifact(token: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(token);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    db.close();
  } catch (e) {
    console.warn('[artifactCache] clear failed:', e);
  }
}
