/**
 * Test Data Injector
 * Injects realistic test pages directly into the database for memory loop testing
 */

import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from './deviceId';

// Realistic Dutch summaries that simulate real handwritten notes over time
const threadedContent = [
  // Thread 1: Business/Startup (recurring over months)
  {
    summary: "Gedachten over het starten van een eigen bedrijf. De vrijheid trekt, maar de onzekerheid ook.",
    ocrText: "Wil ik voor mezelf beginnen? De consultancy betaalt goed maar ik voel me leeg. Wat als ik iets bouw dat echt van mij is?",
    tone: "reflective",
    keywords: ["ondernemen", "vrijheid", "onzekerheid", "consulting", "eigen bedrijf"],
    futureYouCues: ["startup", "consultancy", "vrijheid"],
    daysAgo: 120
  },
  {
    summary: "Verder nadenken over ondernemerschap. Gesprek met Marco gehad.",
    ocrText: "Gesprek met Marco gehad. Hij zegt: spring niet zonder parachute, maar wacht ook niet tot alles perfect is.",
    tone: "hopeful",
    keywords: ["ondernemen", "mentor", "advies", "risico", "starten"],
    futureYouCues: ["Marco", "mentor", "advies"],
    daysAgo: 95
  },
  {
    summary: "Eerste concrete stappen voor het nieuwe bedrijf. Businessplan skeletjes.",
    ocrText: "Kernwaarde: mensen helpen hun handgeschreven gedachten te bewaren. Technologie als brug, niet als doel.",
    tone: "focused",
    keywords: ["ondernemen", "businessplan", "handschrift", "technologie", "waarde"],
    futureYouCues: ["businessplan", "kernwaarde", "technologie"],
    daysAgo: 70
  },
  {
    summary: "Twijfels over de onderneming. Is dit wel het juiste moment?",
    ocrText: "Markt is onzeker. Concurrentie groot. Maar: niemand doet precies dit. De niche is er.",
    tone: "frustrated",
    keywords: ["ondernemen", "twijfel", "markt", "concurrentie", "niche"],
    futureYouCues: ["markt", "concurrentie", "twijfel"],
    daysAgo: 45
  },
  {
    summary: "Doorbraak! Het concept is helder. Nu doorpakken.",
    ocrText: "Memory layer voor handschrift. Dat is het. Niet nog een notes app, maar geheugen infrastructuur.",
    tone: "hopeful",
    keywords: ["ondernemen", "memory", "handschrift", "concept", "doorbraak"],
    futureYouCues: ["memory-layer", "concept", "doorbraak"],
    daysAgo: 20
  },

  // Thread 2: Creativity/Art (recurring)
  {
    summary: "Reflectie op creativiteit en discipline. Ze zijn geen tegenpolen.",
    ocrText: "Creativiteit komt niet van wachten op inspiratie. Het komt van elke dag opduiken, ook als het moeilijk is.",
    tone: "reflective",
    keywords: ["creativiteit", "discipline", "inspiratie", "routine", "werk"],
    futureYouCues: ["creativiteit", "discipline", "routine"],
    daysAgo: 110
  },
  {
    summary: "Schetsen voor een nieuw visueel concept. Geometrie en warmte combineren.",
    ocrText: "De vormen moeten kracht uitstralen maar ook zachtheid. Goud als accent, niet als dominantie.",
    tone: "playful",
    keywords: ["creativiteit", "design", "geometrie", "kleur", "visueel"],
    futureYouCues: ["design", "goud", "geometrie"],
    daysAgo: 85
  },
  {
    summary: "Frustratie over creatief blok. Niets voelt goed.",
    ocrText: "Al dagen vastgelopen. Misschien moet ik juist stoppen met forceren en gaan wandelen.",
    tone: "frustrated",
    keywords: ["creativiteit", "blok", "frustratie", "wandelen", "pauze"],
    futureYouCues: ["creatief-blok", "wandelen", "pauze"],
    daysAgo: 60
  },
  {
    summary: "Doorbraak na de wandeling. De ideeën stromen weer.",
    ocrText: "De natuur reset de geest. Teruggekomen met drie nieuwe concepten. Loslaten werkt.",
    tone: "hopeful",
    keywords: ["creativiteit", "natuur", "ideeën", "loslaten", "doorbraak"],
    futureYouCues: ["natuur", "ideeën", "loslaten"],
    daysAgo: 35
  },

  // Thread 3: Personal Growth (recurring) - with person names
  {
    summary: "Gedachten over wie ik wil worden. Viktor Frankl citaat.",
    ocrText: "Viktor Frankl: je wordt niet wie je bent door na te denken over wie je bent, maar door te handelen en betekenis te scheppen.",
    tone: "reflective",
    keywords: ["groei", "betekenis", "identiteit", "handelen", "frankl"],
    futureYouCues: ["Frankl", "betekenis", "identiteit"],
    daysAgo: 100
  },
  {
    summary: "Grenzen stellen is geen luxe maar noodzaak.",
    ocrText: "Werk-privé balans is een mythe als je geen nee leert zeggen. Nee tegen anderen is ja tegen jezelf.",
    tone: "focused",
    keywords: ["groei", "grenzen", "balans", "nee zeggen", "zelfzorg"],
    futureYouCues: ["grenzen", "balans", "zelfzorg"],
    daysAgo: 75
  },
  {
    summary: "Coaching sessie met Anna over leiderschap.",
    ocrText: "Anna vroeg: wat zou je doen als je niet bang was? Goede vraag. Ik zou groter dromen.",
    tone: "reflective",
    keywords: ["groei", "coaching", "leiderschap", "angst", "dromen"],
    futureYouCues: ["Anna", "coaching", "leiderschap"],
    daysAgo: 50
  },
  {
    summary: "Mijlpaal bereikt. Eerste jaar als ondernemer overleefd.",
    ocrText: "365 dagen. Niet alles ging goed, maar ik ben gegroeid. Dat telt meer dan succes.",
    tone: "hopeful",
    keywords: ["groei", "mijlpaal", "ondernemer", "reflectie", "succes"],
    futureYouCues: ["mijlpaal", "jaar", "ondernemer"],
    daysAgo: 25
  },

  // Thread 4: Technology & Product - with project names
  {
    summary: "Notities over Umarise productvisie.",
    ocrText: "Umarise moet een memory layer zijn, geen notes app. Het gaat om terugvinden, niet organiseren.",
    tone: "focused",
    keywords: ["product", "visie", "memory", "umarise", "terugvinden"],
    futureYouCues: ["Umarise", "visie", "memory"],
    daysAgo: 80
  },
  {
    summary: "Meeting met Moleskine team over partnership.",
    ocrText: "Moleskine wil hun ritueel behouden, wij leveren de memory layer. Win-win als we het goed doen.",
    tone: "hopeful",
    keywords: ["product", "moleskine", "partnership", "ritueel", "samenwerking"],
    futureYouCues: ["Moleskine", "partnership", "meeting"],
    daysAgo: 40
  },
  {
    summary: "Demo feedback van Peter. Hij snapte het meteen.",
    ocrText: "Peter: 'Dit is Photos voor handschrift.' Precies. Eindelijk iemand die de kern pakt.",
    tone: "hopeful",
    keywords: ["product", "demo", "feedback", "peter", "photos"],
    futureYouCues: ["Peter", "demo", "feedback"],
    daysAgo: 15
  },

  // Thread 5: Funding & Investment - overlapping topics for disambiguation test
  {
    summary: "Funding gesprek met investeerder voorbereiden.",
    ocrText: "Pitch deck moet scherper. Drie slides: probleem, oplossing, moat. De rest is ruis.",
    tone: "focused",
    keywords: ["funding", "pitch", "investeerder", "deck", "moat"],
    futureYouCues: ["funding", "pitch", "deck"],
    daysAgo: 30
  },
  {
    summary: "Funding meeting met Sarah van Venture Capital.",
    ocrText: "Sarah van VC fund was positief. Vraagt om follow-up met tech due diligence. Spannend.",
    tone: "hopeful",
    keywords: ["funding", "meeting", "sarah", "vc", "due-diligence"],
    futureYouCues: ["Sarah", "VC", "funding"],
    daysAgo: 12
  },
  {
    summary: "Nog een funding gesprek, maar andere hoek.",
    ocrText: "Deze investeerder focust op pricing en revenue model. Andere vragen dan Sarah, maar net zo belangrijk.",
    tone: "reflective",
    keywords: ["funding", "pricing", "revenue", "investeerder", "model"],
    futureYouCues: ["pricing", "revenue", "investeerder"],
    daysAgo: 8
  },

  // Recent captures
  {
    summary: "Observaties over gebruikersgedrag tijdens demo.",
    ocrText: "Ze begrepen het pas toen ze het zelf probeerden. Show, don't tell. De demo is het product.",
    tone: "hopeful",
    keywords: ["gebruiker", "demo", "product", "feedback", "inzicht"],
    futureYouCues: ["demo", "gebruiker", "show-dont-tell"],
    daysAgo: 7
  },
  {
    summary: "Reflectie op de reis tot nu toe. Trots op wat al gebouwd is.",
    ocrText: "Van idee naar werkend product in 6 maanden. Niet perfect, maar echt. Dat telt.",
    tone: "reflective",
    keywords: ["reflectie", "product", "reis", "trots", "voortgang"],
    futureYouCues: ["reis", "trots", "voortgang"],
    daysAgo: 3
  },
  {
    summary: "Nieuwe ideeën voor de toekomst. De roadmap wordt helder.",
    ocrText: "Fase 1: MVP. Fase 2: Partners. Fase 3: Schaal. Eén ding tegelijk, maar het grote plaatje helder.",
    tone: "hopeful",
    keywords: ["toekomst", "roadmap", "fases", "strategie", "visie"],
    futureYouCues: ["roadmap", "fases", "MVP"],
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
  const deviceUserId = getDeviceId();
  if (!deviceUserId) {
    throw new Error('Device ID not found');
  }

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

export async function clearTestData(): Promise<number> {
  const deviceUserId = getDeviceId();
  if (!deviceUserId) {
    throw new Error('Device ID not found');
  }

  // Delete all pages for this device (test data uses stock images from unsplash)
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('device_user_id', deviceUserId)
    .like('image_url', '%unsplash%')
    .select('id');

  if (error) {
    console.error('Failed to clear test data:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Idempotent reset + inject: clears existing test data first, then injects fresh
 * Ensures deterministic state for demo
 */
export async function resetAndInjectTestData(onProgress?: (current: number, total: number) => void): Promise<{ cleared: number; inserted: number }> {
  // First clear existing test data
  const cleared = await clearTestData();
  console.log(`Cleared ${cleared} existing test pages`);
  
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
      'Business/Ondernemen (5 pages)',
      'Creativity/Art (4 pages)',
      'Personal Growth + People (4 pages: Anna, Frankl)',
      'Technology + Projects (3 pages: Umarise, Moleskine, Peter)',
      'Funding (3 pages: Sarah, pricing)',
      'Recent captures (3 pages)'
    ],
    personNames: ['Marco', 'Anna', 'Peter', 'Sarah', 'Viktor Frankl'],
    projectNames: ['Umarise', 'Moleskine'],
    description: 'Realistische Nederlandse handschrift-notities met terugkerende thema\'s, persoonsnamen en projectnamen over 4 maanden. Elke page heeft 3 future_you_cues voor search testing.'
  };
}
