/**
 * UMARISE: Health Check Cron
 * 
 * Called every 5 minutes via pg_cron.
 * - Calls GET /v1-core-health
 * - Logs result to health_checks table
 * - Sends email alerts via Resend on consecutive failures
 * - Sends recovery notification when service restores
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALERT_EMAIL = 'partners@umarise.com';
const HEALTH_ENDPOINT_TIMEOUT_MS = 5000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendKey = Deno.env.get('RESEND_API_KEY');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Get previous consecutive failures
  const { data: lastCheck } = await supabase
    .from('health_checks')
    .select('consecutive_failures, status')
    .order('checked_at', { ascending: false })
    .limit(1)
    .single();

  const prevFailures = lastCheck?.consecutive_failures ?? 0;
  const prevStatus = lastCheck?.status ?? 'operational';

  // 2. Call health endpoint
  let status = 'operational';
  let statusCode = 0;
  let responseTimeMs = 0;
  let errorMessage: string | null = null;

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_ENDPOINT_TIMEOUT_MS);

    const res = await fetch(`${supabaseUrl}/functions/v1/v1-core-health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    responseTimeMs = Date.now() - startTime;
    statusCode = res.status;

    if (res.status === 200) {
      const body = await res.json();
      status = body.status === 'operational' ? 'operational' : 'degraded';
    } else {
      status = 'degraded';
      errorMessage = `HTTP ${res.status}`;
      await res.text(); // consume body
    }
  } catch (err) {
    responseTimeMs = Date.now() - startTime;
    status = 'down';
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
  }

  // 3. Calculate consecutive failures
  const isFailure = status !== 'operational';
  const consecutiveFailures = isFailure ? prevFailures + 1 : 0;

  // 4. Determine alert level
  let alertSent = false;
  const isRecovery = !isFailure && prevStatus !== 'operational' && prevFailures >= 2;

  if (resendKey) {
    // Alert at 2 consecutive failures (10 min)
    if (consecutiveFailures === 2) {
      await sendAlert(resendKey, '⚠️ Umarise Core API — Degraded', 
        `Health check has failed ${consecutiveFailures} times in a row.\n\nStatus: ${status}\nError: ${errorMessage || 'N/A'}\nResponse time: ${responseTimeMs}ms`);
      alertSent = true;
    }
    // URGENT at 6 consecutive failures (30 min)
    else if (consecutiveFailures === 6) {
      await sendAlert(resendKey, '🚨 URGENT: Umarise Core API — Down', 
        `Health check has failed ${consecutiveFailures} times in a row (30+ minutes).\n\nStatus: ${status}\nError: ${errorMessage || 'N/A'}\nResponse time: ${responseTimeMs}ms\n\nImmediate attention required.`);
      alertSent = true;
    }
    // Recovery notification
    else if (isRecovery) {
      await sendAlert(resendKey, '✅ Umarise Core API — Recovered', 
        `Service has recovered after ${prevFailures} consecutive failures.\n\nStatus: operational\nResponse time: ${responseTimeMs}ms`);
      alertSent = true;
    }
  }

  // 5. Log to database
  const { error: insertError } = await supabase
    .from('health_checks')
    .insert({
      status,
      response_time_ms: responseTimeMs,
      status_code: statusCode,
      error_message: errorMessage,
      consecutive_failures: consecutiveFailures,
      alert_sent: alertSent,
    });

  if (insertError) {
    console.error('[health-check-cron] Failed to log:', insertError.message);
  }

  // 6. Cleanup old records (once per run is fine)
  await supabase.rpc('cleanup_old_health_checks');

  return new Response(
    JSON.stringify({ status, consecutive_failures: consecutiveFailures, response_time_ms: responseTimeMs, alert_sent: alertSent }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

async function sendAlert(resendKey: string, subject: string, body: string) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Umarise Monitoring <onboarding@resend.dev>',
        to: [ALERT_EMAIL],
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[health-check-cron] Resend error:', errText);
    } else {
      await res.text();
      console.log('[health-check-cron] Alert sent:', subject);
    }
  } catch (err) {
    console.error('[health-check-cron] Failed to send alert:', err);
  }
}
