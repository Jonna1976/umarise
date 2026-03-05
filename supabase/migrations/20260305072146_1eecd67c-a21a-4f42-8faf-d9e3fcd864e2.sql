CREATE OR REPLACE FUNCTION public.core_metrics_24h()
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'total_requests', COUNT(*),
    'avg_response_time_ms', COALESCE(ROUND(AVG(response_time_ms)), 0),
    'error_count', COUNT(*) FILTER (WHERE status_code >= 400 AND status_code <> 409),
    'duplicate_count', COUNT(*) FILTER (WHERE status_code = 409),
    'by_endpoint', COALESCE(
      (
        SELECT json_object_agg(endpoint, cnt)
        FROM (
          SELECT endpoint, COUNT(*) as cnt
          FROM core_request_log
          WHERE created_at >= now() - interval '24 hours'
          GROUP BY endpoint
        ) sub
      ),
      '{}'::json
    )
  )
  FROM core_request_log
  WHERE created_at >= now() - interval '24 hours';
$function$;