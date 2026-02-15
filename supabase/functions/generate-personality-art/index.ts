import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkCompanionRateLimit, rateLimitResponse } from '../_shared/companionRateLimit.ts';
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

const EXTRA_HEADERS = 'x-device-id';

const AI_RATE_LIMIT = 5; // Image generation is expensive

serve(async (req) => {
  const corsHeaders = getCompanionCorsHeaders(req, EXTRA_HEADERS);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return companionPreflightResponse(req, EXTRA_HEADERS);
  }

  try {
    const { profile, style, device_user_id } = await req.json();

    // Rate limit
    const deviceId = device_user_id || req.headers.get('x-device-id') || 'anonymous';
    const rl = await checkCompanionRateLimit(deviceId, 'generate-personality-art', AI_RATE_LIMIT);
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetInSeconds);
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Missing personality profile" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build artistic prompt based on personality and style
    const stylePrompts: Record<string, string> = {
      tree: `A majestic tree visualization representing a person's soul. The trunk shows strength and grounding (${profile.tension_field?.side_a || 'stability'}), branches reaching toward ${profile.tension_field?.side_b || 'growth'}. Golden leaves represent their superpower: "${profile.superpower}". The roots are deep and intertwined showing their drivers. Style: watercolor illustration, warm sepia tones, artistic, dreamy, intricate details.`,
      
      landscape: `A symbolic landscape painting representing someone's inner world. Mountains in the distance showing ambition, a river flowing through representing the tension between ${profile.tension_field?.side_a || 'one side'} and ${profile.tension_field?.side_b || 'another'}. Golden light breaking through clouds symbolizing their superpower: "${profile.superpower}". Style: impressionist oil painting, warm golden hour lighting, emotional, atmospheric.`,
      
      abstract: `Abstract expressionist artwork visualizing a personality. Flowing shapes and colors representing: ${profile.drivers?.map((d: any) => d.name).join(', ') || 'their drives'}. Central golden burst for their superpower. Tension shown through contrasting forms: ${profile.tension_field?.side_a || 'control'} vs ${profile.tension_field?.side_b || 'chaos'}. Style: Giorgia Lupi data-humanisme inspired, geometric patterns mixed with organic shapes, sepia and gold palette.`,
      
      ocean: `A poetic seascape representing someone's emotional depth. Waves show the tension between ${profile.tension_field?.side_a || 'calm'} and ${profile.tension_field?.side_b || 'storm'}. Golden sunlight on the water represents their superpower: "${profile.superpower}". Depth below suggests hidden drives. Style: romantic painting, Turner-inspired, dramatic lighting, emotional atmosphere.`,
      
      cosmos: `A cosmic visualization of someone's inner universe. Stars and nebulae form patterns representing their core traits. Central bright star is their superpower: "${profile.superpower}". Orbital paths show tensions between ${profile.tension_field?.side_a || 'order'} and ${profile.tension_field?.side_b || 'freedom'}. Style: artistic astronomy, watercolor galaxies, deep purple and gold tones, dreamy and expansive.`,
      
      garden: `A secret garden representing someone's soul. Different flowers for each driver: ${profile.drivers?.map((d: any) => d.name).join(', ') || 'growth'}. A golden path represents their superpower: "${profile.superpower}". Wild and cultivated areas show tension. Style: botanical illustration meets impressionism, warm earth tones, intricate floral details, magical realism.`
    };

    const selectedStyle = style && stylePrompts[style] ? style : 'abstract';
    const basePrompt = stylePrompts[selectedStyle];
    
    // Add personality context
    const fullPrompt = `${basePrompt}

This artwork visualizes: "${profile.tagline || 'A unique personality'}"
Core essence: ${profile.core_identity || 'A person of depth and complexity'}

Create a beautiful, meaningful artwork that someone would proudly share. Ultra high resolution, artistic masterpiece quality. No text or words in the image.`;

    console.log("Generating personality art with style:", selectedStyle);
    console.log("Prompt:", fullPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate artwork" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No artwork generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        image_url: imageUrl,
        style: selectedStyle,
        tagline: profile.tagline
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating personality art:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
