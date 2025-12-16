/**
 * Test Data Injector
 * Injects realistic test pages directly into the database for memory loop testing
 * 
 * IMPORTANT: Demo data is always stored under DEMO_DEVICE_ID, completely separate
 * from the user's real data. This ensures Reset+Inject never touches real pages.
 */

import { supabase } from '@/integrations/supabase/client';
import { DEMO_DEVICE_ID } from './deviceId';

// Realistic English summaries that simulate real handwritten notes over time
const threadedContent = [
  // Thread 1: Business/Startup (recurring over months)
  {
    summary: "Thoughts about starting my own business. The freedom appeals, but so does the uncertainty.",
    ocrText: "Do I want to start my own thing? The consultancy pays well but I feel empty. What if I build something that's truly mine?",
    tone: "reflective",
    keywords: ["entrepreneurship", "freedom", "uncertainty", "consulting", "startup"],
    futureYouCues: ["startup", "consultancy", "freedom"],
    daysAgo: 120
  },
  {
    summary: "More thoughts on entrepreneurship. Had a conversation with Marco.",
    ocrText: "Talked to Marco. He says: don't jump without a parachute, but also don't wait until everything is perfect.",
    tone: "hopeful",
    keywords: ["entrepreneurship", "mentor", "advice", "risk", "starting"],
    futureYouCues: ["Marco", "mentor", "advice"],
    daysAgo: 95
  },
  {
    summary: "First concrete steps for the new company. Business plan sketches.",
    ocrText: "Core value: helping people preserve their handwritten thoughts. Technology as a bridge, not a goal.",
    tone: "focused",
    keywords: ["entrepreneurship", "business-plan", "handwriting", "technology", "value"],
    futureYouCues: ["business-plan", "core-value", "technology"],
    daysAgo: 70
  },
  {
    summary: "Doubts about the venture. Is this the right moment?",
    ocrText: "Market is uncertain. Competition is fierce. But: nobody does exactly this. The niche is there.",
    tone: "frustrated",
    keywords: ["entrepreneurship", "doubt", "market", "competition", "niche"],
    futureYouCues: ["market", "competition", "doubt"],
    daysAgo: 45
  },
  {
    summary: "Breakthrough! The concept is clear. Time to push forward.",
    ocrText: "Memory layer for handwriting. That's it. Not another notes app, but memory infrastructure.",
    tone: "hopeful",
    keywords: ["entrepreneurship", "memory", "handwriting", "concept", "breakthrough"],
    futureYouCues: ["memory-layer", "concept", "breakthrough"],
    daysAgo: 20
  },

  // Thread 2: Creativity/Art (recurring)
  {
    summary: "Reflection on creativity and discipline. They are not opposites.",
    ocrText: "Creativity doesn't come from waiting for inspiration. It comes from showing up every day, even when it's hard.",
    tone: "reflective",
    keywords: ["creativity", "discipline", "inspiration", "routine", "work"],
    futureYouCues: ["creativity", "discipline", "routine"],
    daysAgo: 110
  },
  {
    summary: "Sketches for a new visual concept. Combining geometry and warmth.",
    ocrText: "The shapes must radiate strength but also softness. Gold as an accent, not as dominance.",
    tone: "playful",
    keywords: ["creativity", "design", "geometry", "color", "visual"],
    futureYouCues: ["design", "gold", "geometry"],
    daysAgo: 85
  },
  {
    summary: "Frustration about creative block. Nothing feels right.",
    ocrText: "Stuck for days. Maybe I should stop forcing it and go for a walk.",
    tone: "frustrated",
    keywords: ["creativity", "block", "frustration", "walking", "pause"],
    futureYouCues: ["creative-block", "walking", "pause"],
    daysAgo: 60
  },
  {
    summary: "Breakthrough after the walk. Ideas are flowing again.",
    ocrText: "Nature resets the mind. Came back with three new concepts. Letting go works.",
    tone: "hopeful",
    keywords: ["creativity", "nature", "ideas", "letting-go", "breakthrough"],
    futureYouCues: ["nature", "ideas", "letting-go"],
    daysAgo: 35
  },

  // Thread 3: Personal Growth (recurring) - with person names
  {
    summary: "Thoughts about who I want to become. Viktor Frankl quote.",
    ocrText: "Viktor Frankl: you become who you are not by thinking about who you are, but by acting and creating meaning.",
    tone: "reflective",
    keywords: ["growth", "meaning", "identity", "action", "frankl"],
    futureYouCues: ["Frankl", "meaning", "identity"],
    daysAgo: 100
  },
  {
    summary: "Setting boundaries is not a luxury but a necessity.",
    ocrText: "Work-life balance is a myth if you don't learn to say no. No to others is yes to yourself.",
    tone: "focused",
    keywords: ["growth", "boundaries", "balance", "saying-no", "self-care"],
    futureYouCues: ["boundaries", "balance", "self-care"],
    daysAgo: 75
  },
  {
    summary: "Coaching session with Anna about leadership.",
    ocrText: "Anna asked: what would you do if you weren't afraid? Good question. I would dream bigger.",
    tone: "reflective",
    keywords: ["growth", "coaching", "leadership", "fear", "dreams"],
    futureYouCues: ["Anna", "coaching", "leadership"],
    daysAgo: 50
  },
  {
    summary: "Milestone reached. Survived first year as entrepreneur.",
    ocrText: "365 days. Not everything went well, but I've grown. That counts more than success.",
    tone: "hopeful",
    keywords: ["growth", "milestone", "entrepreneur", "reflection", "success"],
    futureYouCues: ["milestone", "year", "entrepreneur"],
    daysAgo: 25
  },

  // Thread 4: Technology & Product - with project names
  {
    summary: "Notes about Umarise product vision.",
    ocrText: "Umarise must be a memory layer, not a notes app. It's about retrieval, not organizing.",
    tone: "focused",
    keywords: ["product", "vision", "memory", "umarise", "retrieval"],
    futureYouCues: ["Umarise", "vision", "memory"],
    daysAgo: 80
  },
  {
    summary: "Meeting with Moleskine team about partnership.",
    ocrText: "Moleskine wants to keep their ritual, we provide the memory layer. Win-win if we do it right.",
    tone: "hopeful",
    keywords: ["product", "moleskine", "partnership", "ritual", "collaboration"],
    futureYouCues: ["Moleskine", "partnership", "meeting"],
    daysAgo: 40
  },
  {
    summary: "Demo feedback from Peter. He got it immediately.",
    ocrText: "Peter: 'This is Photos for handwriting.' Exactly. Finally someone who gets the core.",
    tone: "hopeful",
    keywords: ["product", "demo", "feedback", "peter", "photos"],
    futureYouCues: ["Peter", "demo", "feedback"],
    daysAgo: 15
  },

  // Thread 5: Funding & Investment - overlapping topics for disambiguation test
  {
    summary: "Preparing funding conversation with investor.",
    ocrText: "Pitch deck needs to be sharper. Three slides: problem, solution, moat. The rest is noise.",
    tone: "focused",
    keywords: ["funding", "pitch", "investor", "deck", "moat"],
    futureYouCues: ["funding", "pitch", "deck"],
    daysAgo: 30
  },
  {
    summary: "Funding meeting with Sarah from Venture Capital.",
    ocrText: "Sarah from VC fund was positive. Asks for follow-up with tech due diligence. Exciting.",
    tone: "hopeful",
    keywords: ["funding", "meeting", "sarah", "vc", "due-diligence"],
    futureYouCues: ["Sarah", "VC", "funding"],
    daysAgo: 12
  },
  {
    summary: "Another funding conversation, but different angle.",
    ocrText: "This investor focuses on pricing and revenue model. Different questions than Sarah, but equally important.",
    tone: "reflective",
    keywords: ["funding", "pricing", "revenue", "investor", "model"],
    futureYouCues: ["pricing", "revenue", "investor"],
    daysAgo: 8
  },

  // Recent captures
  {
    summary: "Observations about user behavior during demo.",
    ocrText: "They only understood it when they tried it themselves. Show, don't tell. The demo is the product.",
    tone: "hopeful",
    keywords: ["user", "demo", "product", "feedback", "insight"],
    futureYouCues: ["demo", "user", "show-dont-tell"],
    daysAgo: 7
  },
  {
    summary: "Reflection on the journey so far. Proud of what's been built.",
    ocrText: "From idea to working product in 6 months. Not perfect, but real. That counts.",
    tone: "reflective",
    keywords: ["reflection", "product", "journey", "pride", "progress"],
    futureYouCues: ["journey", "pride", "progress"],
    daysAgo: 3
  },
  {
    summary: "New ideas for the future. The roadmap is becoming clear.",
    ocrText: "Phase 1: MVP. Phase 2: Partners. Phase 3: Scale. One thing at a time, but the big picture is clear.",
    tone: "hopeful",
    keywords: ["future", "roadmap", "phases", "strategy", "vision"],
    futureYouCues: ["roadmap", "phases", "MVP"],
    daysAgo: 1
  }
];

// Stock images that look like handwriting/notebooks
const handwritingImages = [
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop',
];

function randomImage(): string {
  return handwritingImages[Math.floor(Math.random() * handwritingImages.length)];
}

function daysAgoToDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export async function injectTestData(onProgress?: (current: number, total: number) => void): Promise<number> {
  // Always use DEMO_DEVICE_ID for demo data - never touches user's real data
  const deviceUserId = DEMO_DEVICE_ID;

  const total = threadedContent.length;
  let inserted = 0;

  for (let i = 0; i < threadedContent.length; i++) {
    const content = threadedContent[i];
    
    const { error } = await supabase
      .from('pages')
      .insert({
        device_user_id: deviceUserId,
        image_url: randomImage(),
        ocr_text: content.ocrText,
        summary: content.summary,
        tone: content.tone,
        keywords: content.keywords,
        primary_keyword: content.keywords[0],
        future_you_cues: content.futureYouCues,
        future_you_cues_source: { ai_prefill_version: 'demo-v1', user_edited: false },
        created_at: daysAgoToDate(content.daysAgo),
        sources: [],
        capsule_id: null,
        page_order: 0,
        project_id: null
      });

    if (error) {
      console.error('Failed to insert test page:', error);
    } else {
      inserted++;
    }

    onProgress?.(i + 1, total);
  }

  return inserted;
}

/**
 * Clear ALL demo pages (only DEMO_DEVICE_ID pages)
 * This NEVER touches the user's real data.
 */
export async function clearAllPagesForDevice(): Promise<number> {
  // Only clear demo pages - user's real data is safe
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('device_user_id', DEMO_DEVICE_ID)
    .select('id');

  if (error) {
    console.error('Failed to clear demo pages:', error);
    return 0;
  }

  return data?.length || 0;
}

export async function clearTestData(): Promise<number> {
  // Only clear demo pages with unsplash images
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('device_user_id', DEMO_DEVICE_ID)
    .like('image_url', '%unsplash%')
    .select('id');

  if (error) {
    console.error('Failed to clear test data:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Idempotent reset + inject: clears ALL existing pages first, then injects fresh demo data.
 * (FIX 3) Ensures deterministic state for demo - one click always produces the same dataset.
 */
export async function resetAndInjectTestData(onProgress?: (current: number, total: number) => void): Promise<{ cleared: number; inserted: number }> {
  // Clear ALL pages for this device (not just unsplash images)
  const cleared = await clearAllPagesForDevice();
  console.log(`Cleared ${cleared} existing pages (all data for device)`);
  
  // Then inject fresh data
  const inserted = await injectTestData(onProgress);
  console.log(`Injected ${inserted} fresh test pages`);
  
  return { cleared, inserted };
}

export function getTestDataInfo() {
  return {
    totalPages: threadedContent.length,
    timeSpan: '4 months',
    threads: [
      'Business/Startup (5 pages)',
      'Creativity/Art (4 pages)',
      'Personal Growth + People (4 pages: Anna, Frankl)',
      'Technology + Projects (3 pages: Umarise, Moleskine, Peter)',
      'Funding (3 pages: Sarah, pricing)',
      'Recent captures (3 pages)'
    ],
    personNames: ['Marco', 'Anna', 'Peter', 'Sarah', 'Viktor Frankl'],
    projectNames: ['Umarise', 'Moleskine'],
    description: 'Realistic English handwritten notes with recurring themes, person names and project names over 4 months. Each page has 3 future_you_cues for search testing.'
  };
}
