/**
 * Client-side helper for the companion-data edge function proxy.
 * All device_user_id-scoped table access goes through this proxy
 * so that direct client access to those tables can be blocked via RLS.
 */
import { supabase } from '@/integrations/supabase/client';

interface ProxyResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

async function invokeProxy<T = unknown>(
  action: string,
  deviceUserId: string,
  params: Record<string, unknown> = {}
): Promise<ProxyResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke('companion-data', {
      body: { action, device_user_id: deviceUserId, ...params },
    });

    if (error) {
      console.error(`[companion-proxy] ${action} error:`, error);
      return { data: null, error: error.message || 'Proxy call failed' };
    }

    // Edge function returns { data: ... } or { error: ... }
    if (data?.error) {
      return { data: null, error: data.error };
    }

    return { data: data?.data as T, error: null };
  } catch (err) {
    console.error(`[companion-proxy] ${action} exception:`, err);
    return { data: null, error: (err as Error).message };
  }
}

// ---- personality_snapshots ----

export async function listPersonalitySnapshots(deviceUserId: string) {
  return invokeProxy<Array<{
    id: string;
    tagline: string;
    superpower: string;
    core_identity: string;
    growth_edge: string;
    page_count: number;
    created_at: string;
    drivers: unknown;
    tension_field: unknown;
  }>>('list_personality_snapshots', deviceUserId);
}

export async function countPersonalitySnapshots(deviceUserId: string) {
  return invokeProxy<{ count: number }>('count_personality_snapshots', deviceUserId);
}

// ---- projects ----

export async function listProjects(deviceUserId: string) {
  return invokeProxy<Array<{
    id: string;
    device_user_id: string;
    name: string;
    created_at: string;
  }>>('list_projects', deviceUserId);
}

export async function createProject(deviceUserId: string, name: string) {
  return invokeProxy<{
    id: string;
    device_user_id: string;
    name: string;
    created_at: string;
  }>('create_project', deviceUserId, { name });
}

// ---- page_origin_hashes ----

export async function lookupOriginHashProxy(
  deviceUserId: string,
  pageId: string
) {
  return invokeProxy<{
    origin_hash_sha256: string;
    origin_hash_algo: string;
  } | null>('lookup_origin_hash', deviceUserId, { page_id: pageId });
}

export async function batchLookupOriginHashes(
  deviceUserId: string,
  pageIds: string[]
) {
  return invokeProxy<Array<{
    page_id: string;
    origin_hash_sha256: string;
    origin_hash_algo: string;
  }>>('batch_lookup_origin_hashes', deviceUserId, { page_ids: pageIds });
}

export async function upsertOriginHash(
  deviceUserId: string,
  params: {
    page_id: string;
    image_url: string;
    origin_hash_sha256: string;
    origin_hash_algo?: string;
  }
) {
  return invokeProxy<{ success: boolean }>('upsert_origin_hash', deviceUserId, params);
}

// ---- hetzner_trash_index ----

export async function listTrashedPageIds(deviceUserId: string) {
  return invokeProxy<string[]>('list_trashed_page_ids', deviceUserId);
}

export async function trashPage(deviceUserId: string, pageId: string) {
  return invokeProxy<{ success: boolean }>('trash_page', deviceUserId, { page_id: pageId });
}

export async function untrashPage(deviceUserId: string, pageId: string) {
  return invokeProxy<{ success: boolean; count: number }>('untrash_page', deviceUserId, { page_id: pageId });
}

export async function deleteTrashEntry(deviceUserId: string, pageId: string) {
  return invokeProxy<{ success: boolean; count: number }>('delete_trash_entry', deviceUserId, { page_id: pageId });
}
