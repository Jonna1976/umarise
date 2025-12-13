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
    daysAgo: 120
  },
  {
    summary: "Verder nadenken over ondernemerschap. Het idee wordt concreter maar de angst ook.",
    ocrText: "Gesprek met mentor gehad. Hij zegt: spring niet zonder parachute, maar wacht ook niet tot alles perfect is.",
    tone: "hopeful",
    keywords: ["ondernemen", "mentor", "advies", "risico", "starten"],
    daysAgo: 95
  },
  {
    summary: "Eerste concrete stappen voor het nieuwe bedrijf. Businessplan skeletjes.",
    ocrText: "Kernwaarde: mensen helpen hun handgeschreven gedachten te bewaren. Technologie als brug, niet als doel.",
    tone: "focused",
    keywords: ["ondernemen", "businessplan", "handschrift", "technologie", "waarde"],
    daysAgo: 70
  },
  {
    summary: "Twijfels over de onderneming. Is dit wel het juiste moment?",
    ocrText: "Markt is onzeker. Concurrentie groot. Maar: niemand doet precies dit. De niche is er.",
    tone: "frustrated",
    keywords: ["ondernemen", "twijfel", "markt", "concurrentie", "niche"],
    daysAgo: 45
  },
  {
    summary: "Doorbraak! Het concept is helder. Nu doorpakken.",
    ocrText: "Memory layer voor handschrift. Dat is het. Niet nog een notes app, maar geheugen infrastructuur.",
    tone: "hopeful",
    keywords: ["ondernemen", "memory", "handschrift", "concept", "doorbraak"],
    daysAgo: 20
  },

  // Thread 2: Creativity/Art (recurring)
  {
    summary: "Reflectie op creativiteit en discipline. Ze zijn geen tegenpolen.",
    ocrText: "Creativiteit komt niet van wachten op inspiratie. Het komt van elke dag opduiken, ook als het moeilijk is.",
    tone: "reflective",
    keywords: ["creativiteit", "discipline", "inspiratie", "routine", "werk"],
    daysAgo: 110
  },
  {
    summary: "Schetsen voor een nieuw visueel concept. Geometrie en warmte combineren.",
    ocrText: "De vormen moeten kracht uitstralen maar ook zachtheid. Goud als accent, niet als dominantie.",
    tone: "playful",
    keywords: ["creativiteit", "design", "geometrie", "kleur", "visueel"],
    daysAgo: 85
  },
  {
    summary: "Frustratie over creatief blok. Niets voelt goed.",
    ocrText: "Al dagen vastgelopen. Misschien moet ik juist stoppen met forceren en gaan wandelen.",
    tone: "frustrated",
    keywords: ["creativiteit", "blok", "frustratie", "wandelen", "pauze"],
    daysAgo: 60
  },
  {
    summary: "Doorbraak na de wandeling. De ideeën stromen weer.",
    ocrText: "De natuur reset de geest. Teruggekomen met drie nieuwe concepten. Loslaten werkt.",
    tone: "hopeful",
    keywords: ["creativiteit", "natuur", "ideeën", "loslaten", "doorbraak"],
    daysAgo: 35
  },

  // Thread 3: Personal Growth (recurring)
  {
    summary: "Gedachten over wie ik wil worden. Niet wat ik wil doen.",
    ocrText: "Viktor Frankl: je wordt niet wie je bent door na te denken over wie je bent, maar door te handelen en betekenis te scheppen.",
    tone: "reflective",
    keywords: ["groei", "betekenis", "identiteit", "handelen", "frankl"],
    daysAgo: 100
  },
  {
    summary: "Grenzen stellen is geen luxe maar noodzaak.",
    ocrText: "Werk-privé balans is een mythe als je geen nee leert zeggen. Nee tegen anderen is ja tegen jezelf.",
    tone: "focused",
    keywords: ["groei", "grenzen", "balans", "nee zeggen", "zelfzorg"],
    daysAgo: 75
  },
  {
    summary: "Reflectie op falen. Elke mislukking is een leermoment.",
    ocrText: "De pitch ging niet goed. Maar: ik leerde wat niet werkt. Dat is waardevoller dan nooit proberen.",
    tone: "reflective",
    keywords: ["groei", "falen", "leren", "pitch", "doorzetten"],
    daysAgo: 50
  },
  {
    summary: "Dankbaarheid als praktijk, niet als concept.",
    ocrText: "Elke ochtend drie dingen noteren waar ik dankbaar voor ben. Klein ritueel, groot effect.",
    tone: "hopeful",
    keywords: ["groei", "dankbaarheid", "ritueel", "mindfulness", "ochtend"],
    daysAgo: 25
  },

  // Thread 4: Technology/Innovation
  {
    summary: "AI moet de mens dienen, niet andersom.",
    ocrText: "Technologie als enabler, niet als replacement. De vraag is niet wat AI kan, maar wat wij willen.",
    tone: "focused",
    keywords: ["technologie", "AI", "ethiek", "mens", "toekomst"],
    daysAgo: 90
  },
  {
    summary: "Privacy is een recht, geen luxe.",
    ocrText: "Zero-knowledge architectuur. De gebruiker bezit de data. Wij faciliteren, we bezitten niet.",
    tone: "determined",
    keywords: ["technologie", "privacy", "data", "eigenaarschap", "ethiek"],
    daysAgo: 55
  },
  {
    summary: "Simpelheid wint altijd op de lange termijn.",
    ocrText: "Complexiteit is makkelijk. Simpelheid is moeilijk. Maar simpel is wat mensen willen en nodig hebben.",
    tone: "reflective",
    keywords: ["technologie", "simpelheid", "design", "gebruiker", "product"],
    daysAgo: 30
  },

  // Recent captures (last 2 weeks)
  {
    summary: "Plannen voor de komende week. Focus op drie prioriteiten.",
    ocrText: "1) MVP afmaken 2) Partner gesprek voorbereiden 3) Rust nemen. In die volgorde.",
    tone: "focused",
    keywords: ["planning", "prioriteiten", "MVP", "partner", "rust"],
    daysAgo: 10
  },
  {
    summary: "Observaties over gebruikersgedrag tijdens demo.",
    ocrText: "Ze begrepen het pas toen ze het zelf probeerden. Show, don't tell. De demo is het product.",
    tone: "hopeful",
    keywords: ["gebruiker", "demo", "product", "feedback", "inzicht"],
    daysAgo: 7
  },
  {
    summary: "Reflectie op de reis tot nu toe. Trots op wat al gebouwd is.",
    ocrText: "Van idee naar werkend product in 6 maanden. Niet perfect, maar echt. Dat telt.",
    tone: "reflective",
    keywords: ["reflectie", "product", "reis", "trots", "voortgang"],
    daysAgo: 3
  },
  {
    summary: "Nieuwe ideeën voor de toekomst. De roadmap wordt helder.",
    ocrText: "Fase 1: MVP. Fase 2: Partners. Fase 3: Schaal. Eén ding tegelijk, maar het grote plaatje helder.",
    tone: "hopeful",
    keywords: ["toekomst", "roadmap", "fases", "strategie", "visie"],
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

export function getTestDataInfo() {
  return {
    totalPages: threadedContent.length,
    timeSpan: '4 months',
    threads: [
      'Business/Ondernemen (5 pages)',
      'Creativity/Art (4 pages)',
      'Personal Growth (4 pages)',
      'Technology (3 pages)',
      'Recent captures (4 pages)'
    ],
    description: 'Realistische Nederlandse handschrift-notities met terugkerende thema\'s over 4 maanden, ontworpen om patterns, threads en personality te testen.'
  };
}
