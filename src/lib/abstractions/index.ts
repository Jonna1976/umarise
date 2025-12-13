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
import { LovableCloudStorage, HetznerVaultStorage, type IStorageProvider } from './storage';
import { LovableAIProvider, HetznerAIProvider, type IAIProvider } from './ai';

// ============= Configuration =============

function getBackendConfig(): BackendConfig {
  // Read from environment or default to lovable-cloud
  const provider = (import.meta.env.VITE_BACKEND_PROVIDER || 'lovable-cloud') as BackendProvider;
  
  return {
    provider,
    // Lovable Cloud config (auto-configured)
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    // Hetzner config (future - would be set when migrating)
    hetznerApiUrl: import.meta.env.VITE_HETZNER_API_URL,
    vaultEndpoint: import.meta.env.VITE_VAULT_ENDPOINT,
    aiEndpoint: import.meta.env.VITE_AI_ENDPOINT,
    ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY,
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
export type { IAIProvider } from './ai';
