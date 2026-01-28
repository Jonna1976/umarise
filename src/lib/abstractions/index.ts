/**
 * Umarise Abstraction Layer - Factory & Exports
 * 
 * This module provides the factory functions to get the correct
 * backend implementations based on configuration.
 * 
 * MIGRATION PATH:
 * 1. Current: Lovable Cloud (Supabase + Lovable AI)
 * 2. Future: Hetzner Stack (Vault + IPFS + BERT + Ollama)
 * 
 * To migrate:
 * 1. Implement HetznerVaultStorage and HetznerAIProvider
 * 2. Set VITE_BACKEND_PROVIDER=hetzner in environment
 * 3. Frontend code remains unchanged
 */

import type { BackendConfig, BackendProvider } from './types';
import { LovableCloudStorage, HetznerVaultStorage, type IStorageProvider, initPreloadStorage } from './storage';
import { LovableAIProvider, HetznerAIProvider, type IAIProvider } from './ai';

// ============= Configuration =============

// Hetzner Privacy Vault - Production endpoint (SSL via vault.umarise.com)
// All services proxied through Nginx on port 443
const HETZNER_PRODUCTION_URL = 'https://vault.umarise.com';

// Legacy direct ports (for reference only - blocked in production)
const HETZNER_LEGACY_PORTS = {
  vaultPort: 3342,      // Codex Storage -> /api/codex
  visionPort: 3341,     // Vision/AI Service -> /api/vision
  ipfsPort: 5001,       // IPFS Gateway
  ollamaPort: 11434,    // Ollama LLM
  bertPort: 3337,       // BERT embeddings
  whisperPort: 3335,    // Whisper audio
  spacyPort: 8081,      // SpaCy NLP
};

/**
 * Check if Hetzner backend is enabled
 *
 * HARDCODED: Hetzner Vault is the ONLY backend for Umarise.
 * 
 * After the pilot migration (Jan 2026), all data lives exclusively 
 * on the Hetzner Privacy Vault. Lovable Cloud/Supabase is FROZEN
 * and no longer used for any page operations.
 * 
 * This prevents any accidental data writes to the wrong backend.
 */
export function isHetznerEnabled(): boolean {
  // ALWAYS Hetzner - no exceptions, no overrides, no switching
  // This is a hard architectural decision, not a configuration option
  return true;
}

/**
 * Toggle Hetzner backend on/off
 * 
 * DEPRECATED: This function is now a no-op.
 * Hetzner is hardcoded as the only backend after pilot migration.
 * Kept for backwards compatibility with any UI that might call it.
 */
export function setHetznerEnabled(_enabled: boolean): void {
  console.warn('[Umarise] Backend switching is disabled. Hetzner Vault is the only backend.');
  // No-op: Hetzner is always enabled
}

function getBackendConfig(): BackendConfig {
  const useHetzner = isHetznerEnabled();
  const provider: BackendProvider = useHetzner ? 'hetzner' : 'lovable-cloud';
  
  return {
    provider,
    // Lovable Cloud config (auto-configured)
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    // Hetzner config - production URL with SSL
    hetznerApiUrl: import.meta.env.VITE_HETZNER_API_URL || HETZNER_PRODUCTION_URL,
    vaultEndpoint: import.meta.env.VITE_VAULT_ENDPOINT || HETZNER_PRODUCTION_URL,
    aiEndpoint: import.meta.env.VITE_AI_ENDPOINT || HETZNER_PRODUCTION_URL,
    ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY || HETZNER_PRODUCTION_URL,
  };
}

// ============= Singleton Instances =============

let storageInstance: IStorageProvider | null = null;
let aiInstance: IAIProvider | null = null;

// ============= Factory Functions =============

/**
 * Get the storage provider based on current configuration.
 * Returns a singleton instance.
 */
export function getStorageProvider(): IStorageProvider {
  if (storageInstance) return storageInstance;
  
  const config = getBackendConfig();
  
  switch (config.provider) {
    case 'hetzner':
      if (!config.vaultEndpoint || !config.ipfsGateway) {
        throw new Error('Hetzner configuration incomplete: vaultEndpoint and ipfsGateway required');
      }
      storageInstance = new HetznerVaultStorage({
        vaultEndpoint: config.vaultEndpoint,
        ipfsGateway: config.ipfsGateway,
      });
      break;
      
    case 'lovable-cloud':
    default:
      storageInstance = new LovableCloudStorage();
      break;
  }
  
  // Initialize preload with this provider
  initPreloadStorage(() => storageInstance!);
  
  console.log(`[Umarise] Storage provider initialized: ${config.provider}`);
  return storageInstance;
}

/**
 * Get the AI provider based on current configuration.
 * Returns a singleton instance.
 */
export function getAIProvider(): IAIProvider {
  if (aiInstance) return aiInstance;
  
  const config = getBackendConfig();
  
  switch (config.provider) {
    case 'hetzner':
      if (!config.aiEndpoint) {
        throw new Error('Hetzner configuration incomplete: aiEndpoint required');
      }
      aiInstance = new HetznerAIProvider({
        bertEndpoint: `${config.aiEndpoint}:3337`,
        whisperEndpoint: `${config.aiEndpoint}:3335`,
        spacyEndpoint: `${config.aiEndpoint}:8081`,
        ollamaEndpoint: `${config.aiEndpoint}:11434`,
      });
      break;
      
    case 'lovable-cloud':
    default:
      aiInstance = new LovableAIProvider();
      break;
  }
  
  console.log(`[Umarise] AI provider initialized: ${config.provider}`);
  return aiInstance;
}

/**
 * Get current backend provider name for UI display
 */
export function getCurrentProvider(): BackendProvider {
  return getBackendConfig().provider;
}

/**
 * Reset providers (useful for testing or hot-swapping)
 */
export function resetProviders(): void {
  storageInstance = null;
  aiInstance = null;
}

// ============= Re-exports =============

export * from './types';
export type { IStorageProvider } from './storage';
export { resolveIpfsUrl, isIpfsUrl, preloadIpfsImages, initPreloadStorage } from './storage';
export type { IAIProvider } from './ai';
