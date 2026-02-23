/**
 * Pre-flight capability check
 * 
 * Verifies that all required browser APIs are available before
 * the user attempts to anchor. Shows a clear message if something
 * is blocked (e.g. Private Browsing, HTTP, old browser).
 */

export interface PreflightResult {
  ok: boolean;
  failures: string[];
}

export async function runPreflightCheck(): Promise<PreflightResult> {
  const failures: string[] = [];

  // 1. crypto.subtle (requires HTTPS or localhost)
  if (!globalThis.crypto?.subtle) {
    failures.push('Secure context required — open via HTTPS');
  }

  // 2. crypto.randomUUID
  if (typeof globalThis.crypto?.randomUUID !== 'function') {
    failures.push('crypto.randomUUID not available — update your browser');
  }

  // 3. IndexedDB (blocked in Safari Private Browsing, Firefox Strict)
  try {
    const testDb = indexedDB.open('_preflight_test', 1);
    await new Promise<void>((resolve, reject) => {
      testDb.onerror = () => reject(new Error('IndexedDB blocked'));
      testDb.onsuccess = () => {
        testDb.result.close();
        // Clean up
        try { indexedDB.deleteDatabase('_preflight_test'); } catch {}
        resolve();
      };
      // Safari Private Browsing: onupgradeneeded fires but transaction aborts
      testDb.onupgradeneeded = () => {
        try {
          testDb.result.createObjectStore('test');
        } catch {
          reject(new Error('IndexedDB read-only (Private Browsing?)'));
        }
      };
      // Timeout fallback
      setTimeout(() => reject(new Error('IndexedDB timeout')), 3000);
    });
  } catch (e: any) {
    failures.push(`Local storage blocked — ${e.message || 'disable Private Browsing'}`);
  }

  // 4. FileReader
  if (typeof FileReader === 'undefined') {
    failures.push('FileReader not available — update your browser');
  }

  return { ok: failures.length === 0, failures };
}
