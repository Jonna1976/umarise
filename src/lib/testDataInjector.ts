/**
 * Test Data Injector
 * Injects realistic test pages for demo purposes
 * 
 * IMPORTANT: Demo data is stored under DEMO_DEVICE_ID, completely separate
 * from the user's real data. Reset+Inject NEVER touches real pages.
 * 
 * =============================================================================
 * PERSONA DEFINITIONS
 * =============================================================================
 * 
 * ALEXANDER - Tech founder, 34
 * - Obsessed with AI developments, follows OpenAI, Anthropic, Google closely
 * - Building a startup, constantly thinking about funding, pitch decks
 * - Meeting notes with investors, strategy sessions, competitor analysis
 * - Writing style: bullet points, abbreviations, quick sketches
 *
 * SARAH - Writer & researcher, 41  
 * - Working on a book about creativity and memory
 * - Philosophical reflections, quotes from interviews, character sketches
 * - Research notes on neuroscience, interviews with artists
 * - Writing style: flowing prose, marginalia, circled key phrases
 *
 * MARCO - UX Designer, 29
 * - User testing observations, wireframe annotations, design sprint notes
 * - Collaboration notes with dev team, client feedback sessions
 * - Writing style: sketches mixed with text, arrows, highlighted insights
 * =============================================================================
 */

import { supabase } from '@/integrations/supabase/client';
import { DEMO_DEVICE_ID } from './deviceId';

// Capsule IDs for multi-page groupings
const CAPSULE_INVESTOR_PITCH = 'capsule-investor-pitch-001';
const CAPSULE_BOOK_CHAPTER = 'capsule-book-chapter-001';
const CAPSULE_DESIGN_SPRINT = 'capsule-design-sprint-001';

// Page type indicators for variety
type PageType = 'moleskine' | 'spiral' | 'sticky' | 'loose' | 'napkin' | 'index-card';

interface DemoPage {
  persona: 'alexander' | 'sarah' | 'marco';
  pageType: PageType;
  summary: string;
  ocrText: string;
  tone: string;
  keywords: string[];
  futureYouCues: string[];
  daysAgo: number;
  capsuleId?: string;
  pageOrder?: number;
}

const demoPages: DemoPage[] = [
  // =============================================================================
  // ALEXANDER - Tech Founder (AI, Funding, Startup)
  // =============================================================================
  
  // Capsule: Investor Pitch Prep (3 pages)
  {
    persona: 'alexander',
    pageType: 'moleskine',
    summary: "Pitch deck structure for Series A. Three core slides that matter.",
    ocrText: "PITCH STRUCTURE\n- Slide 1: Problem (30 sec max)\n- Slide 2: Solution demo (show dont tell!)\n- Slide 3: Why us / moat\n\nEverything else is appendix. Investors decide in first 2 min.",
    tone: "focused",
    keywords: ["pitch", "series-a", "investors"],
    futureYouCues: ["pitch", "series-a", "slides"],
    daysAgo: 45,
    capsuleId: CAPSULE_INVESTOR_PITCH,
    pageOrder: 0
  },
  {
    persona: 'alexander',
    pageType: 'moleskine',
    summary: "Competitive analysis notes. What makes us different from Notion, Evernote.",
    ocrText: "COMPETITORS\nNotion = organizing, not memory\nEvernote = dead, no AI\nApple Notes = no retrieval\n\nOUR MOAT:\n1. Handwriting-first (unique input)\n2. Semantic memory layer\n3. Time compounds value",
    tone: "focused",
    keywords: ["competition", "moat", "notion"],
    futureYouCues: ["competitors", "moat", "notion"],
    daysAgo: 44,
    capsuleId: CAPSULE_INVESTOR_PITCH,
    pageOrder: 1
  },
  {
    persona: 'alexander',
    pageType: 'moleskine',
    summary: "Revenue model sketches. B2B vs B2C considerations.",
    ocrText: "REVENUE?\nB2C: freemium hard, churn risk\nB2B: enterprise = long sales cycle\n\nHYBRID:\n- Free tier (5 pages/mo)\n- Pro $9/mo unlimited\n- Team $29/seat\n- Enterprise: custom\n\nAsk: what would YOU pay?",
    tone: "reflective",
    keywords: ["revenue", "pricing", "b2b"],
    futureYouCues: ["revenue", "pricing", "model"],
    daysAgo: 43,
    capsuleId: CAPSULE_INVESTOR_PITCH,
    pageOrder: 2
  },

  // Alexander single pages
  {
    persona: 'alexander',
    pageType: 'napkin',
    summary: "Quick notes from coffee with Ben at Google. AI roadmap insider view.",
    ocrText: "Ben @ Google\n- Gemini 2.0 coming Q1\n- Focus on multimodal\n- They're scared of Anthropic\n\nOpportunity: they need partners who do verticle well. Memory = vertical.",
    tone: "hopeful",
    keywords: ["google", "gemini", "ben"],
    futureYouCues: ["Ben", "Google", "Gemini"],
    daysAgo: 30
  },
  {
    persona: 'alexander',
    pageType: 'loose',
    summary: "OpenAI dev day notes. GPT-5 implications for our product.",
    ocrText: "OPENAI DEV DAY\n- GPT-5 = massive context window\n- Agents are coming (2025)\n- Altman: 'AI will be infrastructure'\n\nFor us: dont compete on AI, use AI. Focus on UX + data moat.",
    tone: "focused",
    keywords: ["openai", "gpt-5", "agents"],
    futureYouCues: ["OpenAI", "GPT-5", "devday"],
    daysAgo: 21
  },
  {
    persona: 'alexander',
    pageType: 'spiral',
    summary: "Meeting with Lisa from Sequoia. She wants a follow-up.",
    ocrText: "Lisa / Sequoia\n- Liked the demo (!)\n- Wants to see retention data\n- 'Interesting angle on memory'\n\nFollow-up: send deck + metrics\nDeadline: Friday\n\nShe mentioned portfolio co doing similar??",
    tone: "hopeful",
    keywords: ["sequoia", "lisa", "vc"],
    futureYouCues: ["Lisa", "Sequoia", "meeting"],
    daysAgo: 14
  },
  {
    persona: 'alexander',
    pageType: 'index-card',
    summary: "Anthropic vs OpenAI comparison for our stack.",
    ocrText: "Claude vs GPT?\nClaude: better reasoning, safer\nGPT: faster, cheaper\n\nFor OCR: GPT-4V good enough\nFor summaries: Claude better\n\nDecision: use both, abstract the layer",
    tone: "focused",
    keywords: ["anthropic", "claude", "tech-stack"],
    futureYouCues: ["Claude", "GPT", "stack"],
    daysAgo: 7
  },

  // =============================================================================
  // SARAH - Writer & Researcher (Book, Creativity, Memory)
  // =============================================================================

  // Capsule: Book Chapter Draft (2 pages)
  {
    persona: 'sarah',
    pageType: 'spiral',
    summary: "Chapter 3 draft: Why handwriting encodes memory differently than typing.",
    ocrText: "CHAPTER 3: THE HAND REMEMBERS\n\nWhen we write by hand, three things happen:\n1. Motor cortex activates (muscle memory)\n2. Visual processing of own marks\n3. Slower pace = deeper encoding\n\nStudies show 29% better recall vs typing. The friction is the feature.",
    tone: "reflective",
    keywords: ["memory", "handwriting", "encoding"],
    futureYouCues: ["chapter-3", "encoding", "recall"],
    daysAgo: 60,
    capsuleId: CAPSULE_BOOK_CHAPTER,
    pageOrder: 0
  },
  {
    persona: 'sarah',
    pageType: 'spiral',
    summary: "Continuation of chapter 3. Interview quote from neuroscientist.",
    ocrText: "Dr. Elena Voss quote:\n'The hand is an extension of thought. When you write, you're not recording - you're thinking through the pen.'\n\nThis connects to embodied cognition. Mind is not just brain, its brain + body + environment.",
    tone: "reflective",
    keywords: ["neuroscience", "voss", "cognition"],
    futureYouCues: ["Voss", "quote", "embodied"],
    daysAgo: 59,
    capsuleId: CAPSULE_BOOK_CHAPTER,
    pageOrder: 1
  },

  // Sarah single pages
  {
    persona: 'sarah',
    pageType: 'moleskine',
    summary: "Interview notes with artist James Chen about his creative process.",
    ocrText: "JAMES CHEN interview\n\nHe keeps 40+ notebooks. Never throws them away.\n'Looking back is like archaeology of my own mind'\n\nHe re-reads old notebooks before starting new projects. Says patterns emerge he didnt see at the time.",
    tone: "hopeful",
    keywords: ["interview", "james", "notebooks"],
    futureYouCues: ["James", "interview", "artist"],
    daysAgo: 52
  },
  {
    persona: 'sarah',
    pageType: 'sticky',
    summary: "Book title brainstorm. Playing with different angles.",
    ocrText: "TITLE IDEAS:\n- The Memory of Paper\n- Written to Remember\n- Ink & Recall\n- The Analog Mind\n\nFavorite: 'The Memory of Paper' - poetic but clear",
    tone: "playful",
    keywords: ["title", "book", "brainstorm"],
    futureYouCues: ["title", "brainstorm", "book"],
    daysAgo: 40
  },
  {
    persona: 'sarah',
    pageType: 'loose',
    summary: "Research on forgetting curve. Ebbinghaus findings still hold.",
    ocrText: "EBBINGHAUS CURVE\n- 50% forgotten in 1 hour\n- 70% forgotten in 24 hours\n- BUT: spaced retrieval reverses this\n\nHandwriting + periodic review = long-term encoding. The app could prompt review...",
    tone: "focused",
    keywords: ["ebbinghaus", "forgetting", "research"],
    futureYouCues: ["Ebbinghaus", "forgetting", "curve"],
    daysAgo: 28
  },
  {
    persona: 'sarah',
    pageType: 'napkin',
    summary: "Idea sparked at cafe. Connection between memory and identity.",
    ocrText: "Thought at Cafe Luna:\n\nMemory isnt just recall, its who we ARE. We construct identity from what we remember.\n\nIf handwriting strengthens memory, does it strengthen self?\n\nThis could be chapter 7...",
    tone: "reflective",
    keywords: ["identity", "memory", "chapter"],
    futureYouCues: ["identity", "cafe", "chapter-7"],
    daysAgo: 18
  },
  {
    persona: 'sarah',
    pageType: 'index-card',
    summary: "Publisher feedback on draft. They want more personal stories.",
    ocrText: "EDITOR NOTES:\n- More personal anecdotes\n- Less academic tone\n- 'Where are YOU in this?'\n\nFair point. I hide behind research. Need to be vulnerable.\n\nDeadline: Jan 15 for revision",
    tone: "frustrated",
    keywords: ["editor", "feedback", "revision"],
    futureYouCues: ["editor", "feedback", "deadline"],
    daysAgo: 5
  },

  // =============================================================================
  // MARCO - UX Designer (User Testing, Design Sprints, Client Work)
  // =============================================================================

  // Capsule: Design Sprint (3 pages)
  {
    persona: 'marco',
    pageType: 'spiral',
    summary: "Day 1 of design sprint. Problem definition with the team.",
    ocrText: "SPRINT DAY 1\n\nProblem: Users dont find their old notes\nHMW: How might we make retrieval feel magical?\n\nInsights from research:\n- Users search by emotion, not keyword\n- 'I know I wrote something about...'\n- Context matters more than content",
    tone: "focused",
    keywords: ["sprint", "hmw", "retrieval"],
    futureYouCues: ["sprint", "day-1", "problem"],
    daysAgo: 35,
    capsuleId: CAPSULE_DESIGN_SPRINT,
    pageOrder: 0
  },
  {
    persona: 'marco',
    pageType: 'spiral',
    summary: "Day 2 sketches. Three concepts for the search experience.",
    ocrText: "SPRINT DAY 2 - SKETCHES\n\nConcept A: Timeline scroll (visual)\nConcept B: AI chat (conversational)\nConcept C: Cue chips (3 words)\n\nTeam voted: Concept C wins\nWhy: fastest to first result, no typing essays",
    tone: "playful",
    keywords: ["sketches", "concepts", "search"],
    futureYouCues: ["sprint", "day-2", "sketches"],
    daysAgo: 34,
    capsuleId: CAPSULE_DESIGN_SPRINT,
    pageOrder: 1
  },
  {
    persona: 'marco',
    pageType: 'spiral',
    summary: "Day 5 prototype test results. Users loved the cue system.",
    ocrText: "SPRINT DAY 5 - TEST RESULTS\n\n5/5 users found target page in <10 sec\n\nQuotes:\n- 'Oh thats clever'\n- 'Like tags but I chose them'\n- 'Finally something that works like my brain'\n\nShip it.",
    tone: "hopeful",
    keywords: ["testing", "results", "prototype"],
    futureYouCues: ["sprint", "day-5", "results"],
    daysAgo: 31,
    capsuleId: CAPSULE_DESIGN_SPRINT,
    pageOrder: 2
  },

  // Marco single pages
  {
    persona: 'marco',
    pageType: 'sticky',
    summary: "User testing observation. People scroll more than they search.",
    ocrText: "USER INSIGHT:\nPeople prefer scrolling to searching!\n\nWhy? Searching = knowing what you want\nScrolling = discovering what you forgot\n\nImplication: make timeline browsable, not just searchable",
    tone: "reflective",
    keywords: ["scrolling", "discovery", "insight"],
    futureYouCues: ["scrolling", "discovery", "users"],
    daysAgo: 25
  },
  {
    persona: 'marco',
    pageType: 'loose',
    summary: "Client meeting notes. Moleskine wants white-label version.",
    ocrText: "MOLESKINE MEETING\n\nThey want:\n- Their branding\n- Integration with paper notebooks\n- Custom onboarding\n\nWe need:\n- API documentation\n- Brand guidelines from them\n- Legal review (IP)\n\nNext: proposal by Friday",
    tone: "focused",
    keywords: ["moleskine", "client", "whitelabel"],
    futureYouCues: ["Moleskine", "client", "proposal"],
    daysAgo: 20
  },
  {
    persona: 'marco',
    pageType: 'napkin',
    summary: "Quick wireframe sketch for the capture flow improvement.",
    ocrText: "[SKETCH]\n\nCamera → Snap → Cues → Done\n\nNo extra screens!\nReduce taps from 7 to 3\n\nThe capture must feel instant. Every extra step = dropout.",
    tone: "focused",
    keywords: ["wireframe", "capture", "flow"],
    futureYouCues: ["wireframe", "capture", "taps"],
    daysAgo: 12
  },
  {
    persona: 'marco',
    pageType: 'index-card',
    summary: "Accessibility notes. Color contrast issues to fix.",
    ocrText: "A11Y AUDIT:\n- Gold on cream = fails WCAG\n- Need darker text alt\n- Screen reader labels missing\n\nPriority: high (legal risk)\nDeadline: before launch",
    tone: "frustrated",
    keywords: ["accessibility", "wcag", "audit"],
    futureYouCues: ["accessibility", "wcag", "contrast"],
    daysAgo: 3
  }
];

// Realistic messy handwriting images per page type
const imagesByPageType: Record<PageType, string[]> = {
  'moleskine': [
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=1000&fit=crop', // dark notebook
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&h=1000&fit=crop', // moleskine page
  ],
  'spiral': [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=1000&fit=crop', // spiral notebook
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=1000&fit=crop', // lined paper
  ],
  'sticky': [
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=1000&fit=crop', // sticky notes
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=1000&fit=crop', // yellow stickies
  ],
  'loose': [
    'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=1000&fit=crop', // loose paper
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=1000&fit=crop', // white paper notes
  ],
  'napkin': [
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=1000&fit=crop', // napkin/paper
    'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=800&h=1000&fit=crop', // rough paper
  ],
  'index-card': [
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=1000&fit=crop', // index cards
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=1000&fit=crop', // note cards
  ]
};

function getImageForPageType(pageType: PageType): string {
  const images = imagesByPageType[pageType];
  return images[Math.floor(Math.random() * images.length)];
}

function daysAgoToDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export async function injectTestData(onProgress?: (current: number, total: number) => void): Promise<number> {
  const deviceUserId = DEMO_DEVICE_ID;
  const total = demoPages.length;
  let inserted = 0;

  for (let i = 0; i < demoPages.length; i++) {
    const page = demoPages[i];
    
    const { error } = await supabase
      .from('pages')
      .insert({
        device_user_id: deviceUserId,
        image_url: getImageForPageType(page.pageType),
        ocr_text: page.ocrText,
        summary: page.summary,
        tone: page.tone,
        keywords: page.keywords,
        primary_keyword: page.keywords[0],
        future_you_cues: page.futureYouCues,
        future_you_cues_source: { ai_prefill_version: 'demo-v2', user_edited: false },
        created_at: daysAgoToDate(page.daysAgo),
        sources: [],
        capsule_id: page.capsuleId || null,
        page_order: page.pageOrder || 0,
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
 * Idempotent reset + inject: clears ALL existing demo pages, then injects fresh data.
 * One click = deterministic demo state.
 */
export async function resetAndInjectTestData(onProgress?: (current: number, total: number) => void): Promise<{ cleared: number; inserted: number }> {
  const cleared = await clearAllPagesForDevice();
  console.log(`Cleared ${cleared} existing demo pages`);
  
  const inserted = await injectTestData(onProgress);
  console.log(`Injected ${inserted} fresh demo pages`);
  
  return { cleared, inserted };
}

export function getTestDataInfo() {
  const alexanderPages = demoPages.filter(p => p.persona === 'alexander').length;
  const sarahPages = demoPages.filter(p => p.persona === 'sarah').length;
  const marcoPages = demoPages.filter(p => p.persona === 'marco').length;
  const capsulePages = demoPages.filter(p => p.capsuleId).length;

  return {
    totalPages: demoPages.length,
    timeSpan: '2 months',
    personas: {
      alexander: `${alexanderPages} pages (tech founder, AI, funding)`,
      sarah: `${sarahPages} pages (writer, book on memory)`,
      marco: `${marcoPages} pages (UX designer, sprints)`
    },
    capsules: [
      'Investor Pitch Prep (3 pages)',
      'Book Chapter Draft (2 pages)',
      'Design Sprint (3 pages)'
    ],
    singlePages: demoPages.length - capsulePages,
    pageTypes: ['moleskine', 'spiral', 'sticky', 'loose', 'napkin', 'index-card'],
    personNames: ['Ben (Google)', 'Lisa (Sequoia)', 'James Chen (artist)', 'Dr. Elena Voss', 'Moleskine team'],
    searchTestQueries: [
      '"Lisa" → Sequoia meeting',
      '"pitch" → investor capsule',
      '"chapter-3" → Sarah book draft',
      '"sprint" → Marco design sprint capsule',
      '"Moleskine" → appears in both Alexander + Marco (disambiguation test)'
    ],
    description: 'Realistic English demo with 3 personas, multi-page capsules, diverse page types, and overlapping topics for search/disambiguation testing.'
  };
}

/**
 * Copy real user pages to demo device ID.
 * This creates duplicates under DEMO_DEVICE_ID while keeping originals safe.
 * Reset+Inject will only affect the copies, never the originals.
 */
export async function copyRealPagesToDemo(
  realDeviceId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ copied: number; skipped: number }> {
  console.log(`[copyRealPagesToDemo] Fetching pages from real device: ${realDeviceId}`);
  
  // First, fetch all real pages
  const { data: realPages, error: fetchError } = await supabase
    .from('pages')
    .select('*')
    .eq('device_user_id', realDeviceId)
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('Failed to fetch real pages:', fetchError);
    throw new Error('Failed to fetch real pages');
  }

  if (!realPages || realPages.length === 0) {
    console.log('No real pages to copy');
    return { copied: 0, skipped: 0 };
  }

  console.log(`[copyRealPagesToDemo] Found ${realPages.length} real pages to copy`);

  // Clear existing demo pages first to avoid duplicates
  const cleared = await clearAllPagesForDevice();
  console.log(`[copyRealPagesToDemo] Cleared ${cleared} existing demo pages`);

  let copied = 0;
  let skipped = 0;
  const total = realPages.length;

  for (const page of realPages) {
    try {
      // Create a copy with DEMO_DEVICE_ID (new ID will be auto-generated)
      const { id, created_at, updated_at, ...pageData } = page;
      
      const { error: insertError } = await supabase
        .from('pages')
        .insert({
          ...pageData,
          device_user_id: DEMO_DEVICE_ID,
          // Keep original timestamps for realistic demo
          created_at: page.created_at,
          written_at: page.written_at,
        });

      if (insertError) {
        console.error(`Failed to copy page ${id}:`, insertError);
        skipped++;
      } else {
        copied++;
      }

      if (onProgress) {
        onProgress(copied + skipped, total);
      }
    } catch (err) {
      console.error(`Error copying page:`, err);
      skipped++;
    }
  }

  console.log(`[copyRealPagesToDemo] Copied ${copied} pages, skipped ${skipped}`);
  return { copied, skipped };
}
