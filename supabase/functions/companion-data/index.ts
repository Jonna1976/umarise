import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkCompanionRateLimit, rateLimitResponse } from '../_shared/companionRateLimit.ts'
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts'

const EXTRA_HEADERS = 'x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'

const RATE_LIMIT_PER_MIN = 50

const VALID_ACTIONS = [
  // personality_snapshots
  'list_personality_snapshots',
  'count_personality_snapshots',
  // projects
  'list_projects',
  'create_project',
  // page_origin_hashes
  'lookup_origin_hash',
  'batch_lookup_origin_hashes',
  'upsert_origin_hash',
  // hetzner_trash_index
  'list_trashed_page_ids',
  'trash_page',
  'untrash_page',
  'delete_trash_entry',
] as const

type Action = typeof VALID_ACTIONS[number]

function validateDeviceUserId(id: unknown): string {
  if (typeof id !== 'string' || id.length < 36) {
    throw new Error('Invalid device_user_id')
  }
  return id
}

Deno.serve(async (req) => {
  const corsHeaders = getCompanionCorsHeaders(req, EXTRA_HEADERS)

  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req, EXTRA_HEADERS)
  }

  try {
    const body = await req.json()
    const { action, device_user_id, ...params } = body

    if (!VALID_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const deviceUserId = validateDeviceUserId(device_user_id)

    // Rate limit check
    const rl = await checkCompanionRateLimit(deviceUserId, 'companion-data', RATE_LIMIT_PER_MIN)
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetInSeconds)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let result: unknown

    switch (action as Action) {
      // ---- personality_snapshots ----
      case 'list_personality_snapshots': {
        const { data, error } = await supabase
          .from('personality_snapshots')
          .select('id, tagline, superpower, core_identity, growth_edge, page_count, created_at, drivers, tension_field')
          .eq('device_user_id', deviceUserId)
          .order('created_at', { ascending: true })
        if (error) throw error
        result = data
        break
      }

      case 'count_personality_snapshots': {
        const { count, error } = await supabase
          .from('personality_snapshots')
          .select('id', { count: 'exact', head: true })
          .eq('device_user_id', deviceUserId)
        if (error) throw error
        result = { count }
        break
      }

      // ---- projects ----
      case 'list_projects': {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('device_user_id', deviceUserId)
          .order('created_at', { ascending: false })
        if (error) throw error
        result = data
        break
      }

      case 'create_project': {
        const name = params.name
        if (typeof name !== 'string' || name.trim().length === 0 || name.length > 200) {
          return new Response(
            JSON.stringify({ error: 'Invalid project name' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data, error } = await supabase
          .from('projects')
          .insert({ device_user_id: deviceUserId, name: name.trim() })
          .select()
          .single()
        if (error) throw error
        result = data
        break
      }

      // ---- page_origin_hashes ----
      case 'lookup_origin_hash': {
        const pageId = params.page_id
        if (typeof pageId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid page_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data, error } = await supabase
          .from('page_origin_hashes')
          .select('origin_hash_sha256, origin_hash_algo')
          .eq('device_user_id', deviceUserId)
          .eq('page_id', pageId)
          .maybeSingle()
        if (error) throw error
        result = data
        break
      }

      case 'batch_lookup_origin_hashes': {
        const pageIds = params.page_ids
        if (!Array.isArray(pageIds) || pageIds.length === 0 || pageIds.length > 500) {
          return new Response(
            JSON.stringify({ error: 'Invalid page_ids (must be array, 1-500)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data, error } = await supabase
          .from('page_origin_hashes')
          .select('page_id, origin_hash_sha256, origin_hash_algo')
          .eq('device_user_id', deviceUserId)
          .in('page_id', pageIds)
        if (error) throw error
        result = data
        break
      }

      case 'upsert_origin_hash': {
        const { page_id, image_url, origin_hash_sha256, origin_hash_algo } = params
        if (typeof page_id !== 'string' || typeof image_url !== 'string' || typeof origin_hash_sha256 !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { error } = await supabase
          .from('page_origin_hashes')
          .upsert({
            device_user_id: deviceUserId,
            page_id,
            image_url,
            origin_hash_sha256,
            origin_hash_algo: origin_hash_algo || 'sha256',
          }, { onConflict: 'page_id' })
        if (error) throw error
        result = { success: true }
        break
      }

      // ---- hetzner_trash_index ----
      case 'list_trashed_page_ids': {
        const { data, error } = await supabase
          .from('hetzner_trash_index')
          .select('page_id')
          .eq('device_user_id', deviceUserId)
        if (error) throw error
        result = (data || []).map((r: { page_id: string }) => r.page_id)
        break
      }

      case 'trash_page': {
        const pageId = params.page_id
        if (typeof pageId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid page_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { error } = await supabase
          .from('hetzner_trash_index')
          .upsert({
            device_user_id: deviceUserId,
            page_id: pageId,
            trashed_at: new Date().toISOString(),
          }, { onConflict: 'device_user_id,page_id' })
        if (error) throw error
        result = { success: true }
        break
      }

      case 'untrash_page':
      case 'delete_trash_entry': {
        const pageId = params.page_id
        if (typeof pageId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid page_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { error, count } = await supabase
          .from('hetzner_trash_index')
          .delete({ count: 'exact' })
          .eq('device_user_id', deviceUserId)
          .eq('page_id', pageId)
        if (error) throw error
        result = { success: true, count }
        break
      }
    }

    return new Response(
      JSON.stringify({ data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[companion-data]', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
