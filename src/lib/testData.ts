// Test data generator for 100 fake handwritten pages

const summaries = [
  "Gedachten over het opbouwen van een bedrijf dat mensen echt helpt, niet alleen winst maakt.",
  "Schetsen van een nieuw logo-concept — de geometrische vormen moeten kracht en eenvoud uitstralen.",
  "Brainstorm over productfuncties: wat is essentieel vs nice-to-have?",
  "Dagelijkse reflectie: dankbaar voor het team, gefrustreerd door de trage voortgang.",
  "Idee voor een nieuwe podcast-aflevering over creativiteit en discipline.",
  "Aantekeningen van een boek over stoïcisme — focus op wat je kunt beïnvloeden.",
  "Plannen voor de komende sprint: prioriteiten stellen is moeilijk maar noodzakelijk.",
  "Muziekcompositie-ideeën: de melodie moet melancholisch maar hoopvol zijn.",
  "Observaties over gebruikersgedrag: mensen willen simpelheid, geen complexiteit.",
  "Filosofische gedachten over tijd en hoe we die besteden.",
  "Schets van een nieuwe website-layout — de hero moet direct tot actie aanzetten.",
  "Notities over een gesprek met een mentor: 'Focus op één ding en doe dat goed.'",
  "Ideeën voor een nieuw kunstproject — de thematiek draait om verbinding.",
  "Reflectie op falen: elke mislukking is een leermoment, geen eindpunt.",
  "Gedachten over werk-privé balans: grenzen stellen is geen luxe.",
  "Brainstorm over marketingstrategieën: authentiek verhaal vs verkooppraatje.",
  "Aantekeningen van een conferentie: de toekomst van AI en creativiteit.",
  "Dagboeknotitie: vandaag was zwaar, maar morgen is een nieuwe kans.",
  "Schetsen voor een app-interface — de navigatie moet intuïtief zijn.",
  "Gedachten over leiderschap: luisteren is belangrijker dan spreken.",
  "Idee voor een nieuw bedrijf: een platform voor handgeschreven brieven.",
  "Reflectie op succes: het gaat niet om de bestemming maar om de reis.",
  "Aantekeningen over productiviteit: deep work vs constant gestoord worden.",
  "Schetsen van een nieuw meubelontwerp — functie en vorm in balans.",
  "Gedachten over innovatie: niet het wiel opnieuw uitvinden, maar verbeteren.",
  "Brainstorm over een boek dat ik wil schrijven: de structuur is cruciaal.",
  "Notities van een workshop over design thinking: empathie eerst.",
  "Reflectie op relaties: investeer in mensen die investeren in jou.",
  "Ideeën voor een fotoserie: het alledaagse buitengewoon maken.",
  "Gedachten over geld: een tool, geen doel op zich.",
  "Schets van een nieuwe campagne: het verhaal moet emotie oproepen.",
  "Aantekeningen over gezondheid: beweging en rust zijn net zo belangrijk als werk.",
  "Brainstorm over een nieuw product: welk probleem lossen we op?",
  "Reflectie op het verleden: leren van fouten zonder erin vast te zitten.",
  "Idee voor een community-evenement: mensen samenbrengen rond gedeelde passies.",
  "Gedachten over technologie: het moet de mens dienen, niet andersom.",
  "Notities over een interessant artikel: de psychologie van besluitvorming.",
  "Schetsen voor een nieuw interieur: ruimte en licht zijn essentieel.",
  "Reflectie op creativiteit: discipline is de motor, inspiratie de vonk.",
  "Gedachten over onderwijs: hoe kunnen we beter leren leren?",
  "Brainstorm over een nieuw servicemodel: klantbeleving centraal.",
  "Aantekeningen van een podcast: de kracht van kwetsbaarheid.",
  "Idee voor een nieuw spel: simpele regels, diepe strategie.",
  "Gedachten over de natuur: we zijn onderdeel van, niet gescheiden van.",
  "Schets van een nieuwe verpakking: duurzaamheid als kernwaarde.",
  "Reflectie op ambities: dromen groot, beginnen klein.",
  "Notities over teamdynamiek: diversiteit in denken is kracht.",
  "Gedachten over kunst: het gaat om expressie, niet om perfectie.",
  "Brainstorm over een nieuw partnerschap: gedeelde waarden zijn de basis.",
  "Idee voor een documentaire: verhalen die nog niet verteld zijn.",
  "Reflectie op groei: oncomfortabel zijn betekent vooruitgang.",
  "Aantekeningen over een nieuwe techniek: experimenteren is de sleutel.",
  "Gedachten over traditie: wat bewaren we, wat laten we los?",
  "Schets van een nieuw systeem: eenvoud in complexiteit vinden.",
  "Notities over een moeilijk gesprek: empathie en eerlijkheid in balans.",
  "Brainstorm over toekomstplannen: waar wil ik over 5 jaar zijn?",
  "Reflectie op dankbaarheid: kleine dingen maken het verschil.",
  "Idee voor een nieuw ritueel: dagelijkse momenten van stilte.",
  "Gedachten over verandering: weerstand is natuurlijk, maar niet noodzakelijk.",
  "Aantekeningen over een nieuw framework: structuur geeft vrijheid.",
  "Schets van een nieuwe workflow: efficiëntie zonder ziel te verliezen.",
  "Reflectie op mentorschap: leren door te leren aan anderen.",
  "Gedachten over authenticiteit: jezelf zijn is de grootste kracht.",
  "Brainstorm over een nieuw initiatief: impact boven winst.",
  "Notities over een nieuwe hobby: beginnersmindset omarmen.",
  "Idee voor een nieuw format: korte, krachtige content.",
  "Gedachten over rust: niets doen is ook iets doen.",
  "Reflectie op netwerken: kwaliteit boven kwantiteit.",
  "Aantekeningen over een nieuwe tool: technologie als enabler.",
  "Schets van een nieuw concept: de essentie in één beeld vangen.",
  "Gedachten over risico: berekend durven vs roekeloos handelen.",
  "Brainstorm over een nieuw verdienmodel: waarde creëren, waarde vangen.",
  "Notities over een nieuw perspectief: door de ogen van een ander kijken.",
  "Reflectie op routines: gewoontes als fundament voor vrijheid.",
  "Idee voor een nieuw experiment: hypothese, test, leer.",
  "Gedachten over legacy: wat wil ik achterlaten?",
  "Aantekeningen over een nieuwe aanpak: iteratief in plaats van big bang.",
  "Schets van een nieuw dashboard: data tot inzicht maken.",
  "Reflectie op feedback: geschenk, geen aanval.",
  "Gedachten over focus: nee zeggen is ja zeggen tegen wat echt telt.",
  "Brainstorm over een nieuw project: passie meets praktijk.",
  "Notities over een nieuwe samenwerking: 1+1=3 potentieel.",
  "Idee voor een nieuw medium: oude boodschap, nieuwe vorm.",
  "Gedachten over simplicity: complexity is easy, simplicity is hard.",
  "Reflectie op energie: waar komt die vandaan, waar gaat die naartoe?",
  "Aantekeningen over een nieuw proces: systematisch maar flexibel.",
  "Schets van een nieuw product: de gebruiker is de held.",
  "Gedachten over tijdloosheid: trends voorbij, principes blijven.",
  "Brainstorm over een nieuw verhaal: begin met het einde in gedachten.",
  "Notities over een nieuwe skill: 10.000 uur of bewuste oefening?",
  "Reflectie op intuïtie: wanneer vertrouwen, wanneer bevragen?",
  "Idee voor een nieuw platform: gemeenschap als kern.",
  "Gedachten over contrast: licht en donker maken elkaar sterker.",
  "Aantekeningen over een nieuwe mindset: growth over fixed.",
  "Schets van een nieuw systeem: feedback loops inbouwen.",
  "Reflectie op moed: angst voelen en toch doen.",
  "Gedachten over verbinding: in een digitale wereld, menselijk blijven.",
  "Brainstorm over een nieuw avontuur: onbekend terrein verkennen.",
  "Notities over een nieuwe ontdekking: nieuwsgierigheid als kompas.",
  "Idee voor een nieuw begin: tabula rasa, maar met wijsheid van ervaring.",
];

const ocrTexts = [
  "De essentie van een goed product is dat het een probleem oplost dat mensen echt ervaren. Niet een probleem dat we verzinnen omdat het technisch interessant is. Luister naar gebruikers, observeer gedrag, en bouw wat echt nodig is.",
  "Vandaag nagedacht over de balans tussen perfectie en snelheid. Perfectie is de vijand van gedaan. Maar gedaan zonder kwaliteit is zinloos. De kunst is weten wanneer goed genoeg echt goed genoeg is.",
  "Drie inzichten uit het gesprek: 1) Mensen onthouden hoe je ze laat voelen, 2) Eenvoud wint altijd op lange termijn, 3) Authenticiteit is niet te faken.",
  "Ideeën voor de volgende fase: meer focus op mobiel, betere onboarding, snellere feedback loops. Maar eerst: wat is de kernwaarde die we leveren?",
  "Reflectie: waarom doen we dit eigenlijk? Niet voor geld, niet voor roem. Maar om iets te maken dat er toe doet. Dat mensen helpt. Dat blijft.",
  "Schets van het nieuwe concept. De gebruiker opent de app, ziet direct de camera. Geen menu's, geen afleiding. Puur en simpel. De notebook is de held, de app is de sidekick.",
  "Frustratie van vandaag: te veel vergaderingen, te weinig maken. Morgen: blocked time voor deep work. Geen uitzonderingen.",
  "Observatie: de beste producten voelen alsof ze er altijd al waren. Geen uitleg nodig. Geen handleiding. Gewoon... logisch.",
  "Aantekeningen over creativiteit: het komt niet van wachten op inspiratie. Het komt van consistent werken, elke dag, ook als het moeilijk is.",
  "Gedachten over het team: diversiteit in achtergrond maar eenheid in visie. Dat is de magic formula.",
];

const toneOptions = ['grateful', 'happy', 'energetic', 'peaceful', 'excited', 'nostalgic', 'determined', 'curious', 'anxious', 'frustrated', 'hopeful', 'tender', 'restless', 'melancholic', 'playful', 'focused', 'overwhelmed', 'reflective'] as const;

const keywordSets = [
  ['design', 'simplicity', 'user', 'experience', 'flow'],
  ['business', 'strategy', 'growth', 'vision', 'impact'],
  ['creativity', 'art', 'expression', 'form', 'beauty'],
  ['productivity', 'focus', 'deep work', 'time', 'energy'],
  ['philosophy', 'meaning', 'purpose', 'life', 'wisdom'],
  ['technology', 'innovation', 'future', 'tools', 'digital'],
  ['leadership', 'team', 'culture', 'values', 'trust'],
  ['learning', 'growth', 'mindset', 'curiosity', 'practice'],
  ['health', 'balance', 'rest', 'movement', 'wellness'],
  ['relationships', 'connection', 'empathy', 'listening', 'community'],
];

const handwritingImages = [
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop',
];

function randomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTones(): string[] {
  const count = Math.random() > 0.5 ? 2 : 1;
  const tones = [...toneOptions].sort(() => Math.random() - 0.5);
  return tones.slice(0, count);
}

function randomKeywords(): string[] {
  const set = randomItem(keywordSets);
  const count = 3 + Math.floor(Math.random() * 3);
  return [...set].sort(() => Math.random() - 0.5).slice(0, count);
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const randomMs = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - randomMs);
}

export interface TestPage {
  id: string;
  deviceUserId: string;
  imageUrl: string;
  ocrText: string;
  summary: string;
  tone: string[];
  keywords: string[];
  createdAt: Date;
}

export function generateTestPages(count: number = 100): TestPage[] {
  const pages: TestPage[] = [];
  
  for (let i = 0; i < count; i++) {
    pages.push({
      id: `test-${i + 1}`,
      deviceUserId: 'test-device',
      imageUrl: randomItem(handwritingImages),
      ocrText: randomItem(ocrTexts),
      summary: summaries[i % summaries.length],
      tone: randomTones(),
      keywords: randomKeywords(),
      createdAt: randomDate(90), // Last 90 days
    });
  }
  
  // Sort by date (newest first)
  return pages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
