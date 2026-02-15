/**
 * notify-ots-complete Edge Function
 * 
 * Triggered when an OTS proof is successfully anchored on Bitcoin.
 * Sends email notification to authenticated users via auth.users.email.
 * 
 * Expected payload (from database trigger or webhook):
 * {
 *   origin_id: string,
 *   bitcoin_block_height: number,
 *   anchored_at: string
 * }
 * 
 * Lookup chain: origin_id → pages.origin_id → pages.user_id → auth.users.email
 * Anonymous marks (user_id = NULL) receive no notification — intentional.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

interface OtsCompletePayload {
  origin_id: string;
  bitcoin_block_height?: number;
  anchored_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return companionPreflightResponse(req);
  }
  const corsHeaders = getCompanionCorsHeaders(req);

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
    console.log("[notify-ots-complete] Received origin_id:", payload.origin_id);

    if (!payload.origin_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: origin_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Find the page by origin_id (unique 1:1 relationship)
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, user_id, created_at")
      .eq("origin_id", payload.origin_id)
      .maybeSingle();

    if (pageError) {
      console.error("[notify-ots-complete] Page lookup error:", pageError.message);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!page) {
      console.log("[notify-ots-complete] No page found for origin_id:", payload.origin_id);
      return new Response(
        JSON.stringify({ message: "No page found for this origin_id" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Check if user_id exists (anonymous marks have no user_id)
    if (!page.user_id) {
      console.log("[notify-ots-complete] Anonymous mark, no notification:", payload.origin_id);
      return new Response(
        JSON.stringify({ message: "Anonymous mark - no notification" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Get user email from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(page.user_id);

    if (authError || !authData.user) {
      console.error("[notify-ots-complete] User lookup error:", authError?.message || "User not found");
      return new Response(
        JSON.stringify({ message: "User not found in auth" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = authData.user.email;
    if (!email) {
      console.log("[notify-ots-complete] User has no email:", page.user_id);
      return new Response(
        JSON.stringify({ message: "User has no email address" }),
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

    console.log("[notify-ots-complete] Email sent to:", email.replace(/(.{2}).*@/, "$1***@"), emailResult);

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
