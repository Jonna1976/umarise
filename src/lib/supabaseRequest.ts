/**
 * Supabase Request Utility with Device Header Injection
 * 
 * All edge function calls should use this utility to ensure
 * the x-device-id header is automatically included.
 */

import { supabase } from '@/integrations/supabase/client';
import { getActiveDeviceId } from './deviceId';

const DEVICE_HEADER = 'x-device-id';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Make a request to a Supabase edge function with device validation headers
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: Error | null }> {
  const deviceId = getActiveDeviceId();
  
  if (!deviceId) {
    return { 
      data: null, 
      error: new Error('No device ID available') 
    };
  }
  
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: options.body,
      headers: {
        [DEVICE_HEADER]: deviceId,
        ...options.headers,
      },
    });
    
    if (error) {
      return { data: null, error };
    }
    
    return { data: data as T, error: null };
  } catch (e) {
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error('Unknown error') 
    };
  }
}

/**
 * Get headers with device ID for manual fetch calls
 */
export function getDeviceHeaders(): Record<string, string> {
  const deviceId = getActiveDeviceId();
  
  if (!deviceId) {
    console.warn('[supabaseRequest] No device ID available for headers');
    return {};
  }
  
  return { [DEVICE_HEADER]: deviceId };
}

/**
 * Build full edge function URL
 */
export function getEdgeFunctionUrl(functionName: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/${functionName}`;
}

/**
 * Make a raw fetch request to edge function with device headers
 */
export async function fetchEdgeFunction(
  functionName: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getEdgeFunctionUrl(functionName);
  const deviceId = getActiveDeviceId();
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('apikey', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  
  if (deviceId) {
    headers.set(DEVICE_HEADER, deviceId);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}
