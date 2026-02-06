/**
 * notify-ots-complete Edge Function
 * 
 * Triggered when an OTS proof is successfully anchored on Bitcoin.
 * Sends email notification to users who opted in for anchoring alerts.
 * 
 * Expected payload (from database trigger or webhook):
 * {
 *   origin_id: string,
 *   hash: string,
 *   bitcoin_block_height: number,
 *   anchored_at: string
 * }
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OtsCompletePayload {
  origin_id: string;
  hash: string;
  bitcoin_block_height?: number;
  anchored_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("[notify-ots-complete] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendKey);

    const payload: OtsCompletePayload = await req.json();
    console.log("[notify-ots-complete] Received:", payload.origin_id);

    if (!payload.origin_id || !payload.hash) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the page associated with this origin hash
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, user_note, created_at, origin_hash_sha256")
      .eq("origin_hash_sha256", payload.hash)
      .single();

    if (pageError || !page) {
      console.log("[notify-ots-complete] No page found for hash:", payload.hash.substring(0, 16));
      return new Response(
        JSON.stringify({ message: "No page found for this hash" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user opted in for notification (stored as "notify:email@example.com")
    if (!page.user_note || !page.user_note.startsWith("notify:")) {
      console.log("[notify-ots-complete] No notification opt-in for page:", page.id);
      return new Response(
        JSON.stringify({ message: "No notification requested" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = page.user_note.replace("notify:", "").trim();
    if (!email || !email.includes("@")) {
      console.log("[notify-ots-complete] Invalid email in user_note");
      return new Response(
        JSON.stringify({ message: "Invalid email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format date
    const anchoredDate = new Date(payload.anchored_at);
    const formattedDate = anchoredDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Send email
    const emailResult = await resend.emails.send({
      from: "Umarise <noreply@umarise.com>",
      to: [email],
      subject: "Your mark is now anchored on Bitcoin ₿",
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background-color: #050A05; color: #F5F0E6;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 36px; color: #C5935A;">U</span>
          </div>
          
          <h1 style="font-size: 24px; font-weight: 400; color: #C5935A; text-align: center; margin-bottom: 24px;">
            Anchored
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: rgba(245, 240, 230, 0.8); text-align: center; margin-bottom: 24px;">
            Your mark has been permanently anchored on the Bitcoin blockchain.
          </p>
          
          <div style="background: rgba(197, 147, 90, 0.08); border: 1px solid rgba(197, 147, 90, 0.2); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <div style="text-align: center; margin-bottom: 16px;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: rgba(197, 147, 90, 0.7);">ORIGIN</span>
              <p style="font-family: monospace; font-size: 14px; color: #F5F0E6; margin: 4px 0 0;">${payload.origin_id.substring(0, 16).toUpperCase()}</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 16px;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: rgba(197, 147, 90, 0.7);">ANCHORED</span>
              <p style="font-size: 14px; color: rgba(245, 240, 230, 0.7); margin: 4px 0 0;">${formattedDate}</p>
            </div>
            
            ${payload.bitcoin_block_height ? `
            <div style="text-align: center;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: rgba(197, 147, 90, 0.7);">BITCOIN BLOCK</span>
              <p style="font-family: monospace; font-size: 14px; color: rgba(245, 240, 230, 0.5); margin: 4px 0 0;">#${payload.bitcoin_block_height.toLocaleString()}</p>
            </div>
            ` : ""}
          </div>
          
          <p style="font-size: 12px; font-style: italic; color: rgba(245, 240, 230, 0.3); text-align: center;">
            This proof is now independent of us. It exists as long as Bitcoin exists.
          </p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(197, 147, 90, 0.15); text-align: center;">
            <a href="https://umarise.com" style="font-size: 12px; color: rgba(197, 147, 90, 0.6); text-decoration: none;">umarise.com</a>
          </div>
        </div>
      `,
    });

    console.log("[notify-ots-complete] Email sent:", emailResult);

    // Clear the notification flag to prevent duplicate emails
    await supabase
      .from("pages")
      .update({ user_note: `notified:${email}:${payload.anchored_at}` } as any)
      .eq("id", page.id);

    return new Response(
      JSON.stringify({ success: true, email_sent_to: email.replace(/(.{2}).*@/, "$1***@") }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[notify-ots-complete] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
