/**
 * ProofPage - Interactive visualization of the Umarise proof of behavior
 * For demos and investor presentations
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Type, 
  Search, 
  Eye, 
  ShieldCheck, 
  Ban, 
  Database, 
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ExternalLink,
  Shield,
  Clock,
  AlertTriangle,
  GitBranch,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface CodeLink {
  file: string;
  lines?: string;
  description: string;
}

interface ProofPoint {
  id: number;
  icon: React.ReactNode;
  title: string;
  claim: string;
  evidence: string[];
  codeLinks: CodeLink[];
  ciGuard?: string;
}

// Repository base for permalinks (replace with actual repo when available)
const REPO_BASE = "https://github.com/umarise/vault";
const COMMIT_SHA = "main"; // Replace with actual SHA for immutable links

const getPermalink = (file: string, lines?: string): string => {
  const lineFragment = lines ? `#L${lines}` : '';
  return `${REPO_BASE}/blob/${COMMIT_SHA}/${file}${lineFragment}`;
};

const proofPoints: ProofPoint[] = [
  {
    id: 1,
    icon: <Camera className="h-6 w-6" />,
    title: "Foto → 2 woorden → klaar",
    claim: "De wedge werkt zonder uitleg",
    evidence: [
      "Camera opent direct, geen menu",
      "Autocomplete, max 2-3 keywords", 
      "AI analyseert, slaat origineel op",
      "Zoek op woorden, origineel eerst"
    ],
    codeLinks: [
      { file: "src/components/capture/CameraView.tsx", description: "Camera opent direct" },
      { file: "src/components/capture/TopicInput.tsx", lines: "1-50", description: "2-3 woorden input" },
      { file: "src/lib/pageService.ts", description: "createPage() flow" },
      { file: "src/components/codex/SearchView.tsx", description: "Zoekresultaten" }
    ],
    ciGuard: "test('wedge-flow-under-60s')"
  },
  {
    id: 2,
    icon: <Eye className="h-6 w-6" />,
    title: "Origineel altijd zichtbaar",
    claim: "Het origineel is altijd primair in de UI",
    evidence: [
      "imageUrl wordt getoond, niet summary",
      "Summary/keywords zijn secundaire metadata",
      "HistoryView toont image als primair element"
    ],
    codeLinks: [
      { file: "src/components/codex/SearchView.tsx", lines: "150-200", description: "imageUrl primair" },
      { file: "src/components/codex/HistoryView.tsx", description: "h-32 image primair" }
    ],
    ciGuard: "test('origin-always-visible')"
  },
  {
    id: 3,
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "AI kan niets overschrijven",
    claim: "AI-output is metadata, geen object. Origineel is onveranderbaar",
    evidence: [
      "imageUrl staat NIET in de update-interface",
      "Er bestaat geen code-pad om image_url te wijzigen na creatie"
    ],
    codeLinks: [
      { file: "src/lib/pageService.ts", lines: "65-77", description: "updatePage() zonder imageUrl" },
      { file: "src/integrations/supabase/types.ts", lines: "134-166", description: "pages.Update type" }
    ],
    ciGuard: "test('no-image-url-update-path')"
  },
  {
    id: 4,
    icon: <Ban className="h-6 w-6" />,
    title: "Bij twijfel: geen resultaat",
    claim: "Het systeem faalt expliciet bij onzekerheid",
    evidence: [
      "Strict word-boundary matching",
      "Geen fuzzy fallback in productie",
      "Geen 'bedoelde je...?' suggesties",
      "Geen probabilistische ranking met lage confidence"
    ],
    codeLinks: [
      { file: "supabase/functions/search-pages/index.ts", lines: "100-110", description: "Strict matching logic" }
    ],
    ciGuard: "test('no-fuzzy-search-fallback')"
  },
  {
    id: 5,
    icon: <Database className="h-6 w-6" />,
    title: "AI = metadata, geen entiteit",
    claim: "AI heeft geen eigen object-status",
    evidence: [
      "summary, keywords, tone = kolommen, geen FK",
      "Geen ai_analyses tabel",
      "Geen versioning van AI-output"
    ],
    codeLinks: [
      { file: "src/integrations/supabase/types.ts", lines: "65-96", description: "pages table schema" }
    ],
    ciGuard: "test('no-ai-entity-table')"
  },
  {
    id: 6,
    icon: <Layers className="h-6 w-6" />,
    title: "Origin technisch onveranderbaar",
    claim: "Geschiedenis kan niet herschreven worden",
    evidence: [
      "IPFS = content-addressed (CID = hash)",
      "image_url geen UPDATE path",
      "Origineel altijd primair in UI"
    ],
    codeLinks: [
      { file: "src/lib/abstractions/storage.ts", description: "Upload only, geen replace" },
      { file: "supabase/functions/hetzner-storage-proxy/index.ts", description: "IPFS proxy" }
    ],
    ciGuard: "test('origin-immutable')"
  },
  {
    id: 7,
    icon: <Type className="h-6 w-6" />,
    title: "Geen taxonomie, tags, of mappen",
    claim: "Gebruikers hoeven niets te leren",
    evidence: [
      "Enige input: vrije tekst met autocomplete",
      "Geen folders, tags, of hiërarchie tabel",
      "Capture = foto + 2 woorden. Retrieval = zoeken. Klaar."
    ],
    codeLinks: [
      { file: "src/components/capture/TopicInput.tsx", description: "Vrije tekst input" },
      { file: "src/integrations/supabase/types.ts", description: "Geen folders/tags tables" }
    ],
    ciGuard: "test('no-taxonomy-tables')"
  }
];

// Operational SLOs and Failure Policies
const operationalClarity = {
  slos: [
    { metric: "Retrieval Time", target: "< 60 seconden", measurement: "search-telemetry.time_to_select_ms" },
    { metric: "Search Resolution Rate", target: "> 80%", measurement: "search-telemetry.found_it_confirmed" },
    { metric: "Origin Visibility", target: "100%", measurement: "imageUrl primair in alle views" }
  ],
  failurePolicies: [
    { scenario: "IPFS onbereikbaar", action: "STOP: Toon error, geen fallback naar summary" },
    { scenario: "OCR faalt", action: "STOP: Sla page op zonder OCR, retry later" },
    { scenario: "Search uncertain", action: "STOP: Return empty, geen 'misschien'" },
    { scenario: "AI timeout", action: "CONTINUE: Sla page op, AI retry async" }
  ],
  ciGates: [
    { name: "no-image-url-mutation", description: "Faalt als updatePage() imageUrl accepteert" },
    { name: "no-fuzzy-search", description: "Faalt als Levenshtein in search-pages wordt gebruikt" },
    { name: "no-ai-entity", description: "Faalt als ai_analyses of derivatives tabel bestaat" },
    { name: "origin-always-primary", description: "Faalt als summary vóór imageUrl gerenderd wordt" }
  ]
};

const flowSteps = [
  { label: "Foto", duration: "10 sec", color: "bg-primary" },
  { label: "2 woorden", duration: "", color: "bg-primary" },
  { label: "AI indexeert", duration: "15 sec", color: "bg-muted" },
  { label: "Zoeken", duration: "<60 sec", color: "bg-primary" },
  { label: "Origineel getoond", duration: "", color: "bg-green-500" }
];

export default function ProofPage() {
  const navigate = useNavigate();
  const [expandedPoint, setExpandedPoint] = useState<number | null>(null);
  const [flowStep, setFlowStep] = useState(0);

  const advanceFlow = () => {
    if (flowStep < flowSteps.length - 1) {
      setFlowStep(prev => prev + 1);
    } else {
      setFlowStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Proof of Behavior</h1>
            <p className="text-sm text-muted-foreground">Technisch bewijs • Januari 2026</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Terug naar app
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-16">
        
        {/* Hero Statement */}
        <section className="text-center space-y-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-muted-foreground mb-4">Kernstelling</p>
            <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed max-w-3xl mx-auto">
              "Het systeem gedraagt zich alsof oorsprong belangrijker is dan uitleg — 
              <span className="text-primary"> zonder dat iemand dat hoeft te onthouden, kiezen of bewaken.</span>"
            </blockquote>
          </motion.div>
        </section>

        {/* Interactive Flow Visualization */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-center">De Wedge Flow</h2>
          
          <div className="bg-muted/30 rounded-2xl p-8 border border-border">
            {/* Flow Steps */}
            <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto pb-2">
              {flowSteps.map((step, index) => (
                <motion.div 
                  key={step.label}
                  className="flex items-center gap-2 flex-shrink-0"
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: index <= flowStep ? 1 : 0.5,
                    scale: index === flowStep ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors duration-300
                    ${index <= flowStep ? step.color + ' text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {index < flowStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${index <= flowStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {step.duration && (
                      <p className="text-xs text-muted-foreground">{step.duration}</p>
                    )}
                  </div>
                  {index < flowSteps.length - 1 && (
                    <ArrowRight className={`h-4 w-4 mx-2 ${index < flowStep ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Current Step Detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={flowStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-8 border-t border-border"
              >
                {flowStep === 0 && (
                  <div className="space-y-2">
                    <Camera className="h-12 w-12 mx-auto text-primary" />
                    <p className="text-lg font-medium">Camera opent direct</p>
                    <p className="text-muted-foreground">Geen menu, geen onboarding, geen keuzes</p>
                  </div>
                )}
                {flowStep === 1 && (
                  <div className="space-y-2">
                    <Type className="h-12 w-12 mx-auto text-primary" />
                    <p className="text-lg font-medium">"Waar gaat dit over?"</p>
                    <p className="text-muted-foreground">2-3 woorden met autocomplete. Geen taxonomie nodig.</p>
                  </div>
                )}
                {flowStep === 2 && (
                  <div className="space-y-2">
                    <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                    <p className="text-lg font-medium">AI indexeert (niet vervangt)</p>
                    <p className="text-muted-foreground">OCR + keywords + summary → metadata, niet canon</p>
                  </div>
                )}
                {flowStep === 3 && (
                  <div className="space-y-2">
                    <Search className="h-12 w-12 mx-auto text-primary" />
                    <p className="text-lg font-medium">Zoek op 2 woorden</p>
                    <p className="text-muted-foreground">Strict matching. Bij twijfel → geen resultaat.</p>
                  </div>
                )}
                {flowStep === 4 && (
                  <div className="space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-lg font-medium">Origineel getoond — niet summary</p>
                    <p className="text-muted-foreground">Handschrift = waarheid. Altijd.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="text-center">
              <Button onClick={advanceFlow} size="lg">
                {flowStep < flowSteps.length - 1 ? 'Volgende stap' : 'Opnieuw'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Anti-Growth Behavior Callout */}
        <section className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="bg-destructive/20 rounded-full p-3 flex-shrink-0">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Anti-Growth Gedrag</h3>
              <p className="text-muted-foreground">
                "Bij twijfel → geen resultaat" is cruciaal bewijs, want:
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span> Dit kost engagement
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span> Dit kost metrics
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span> Dit kost growth
                </li>
              </ul>
              <p className="text-foreground font-medium pt-2">
                Niemand doet dit per ongeluk. Dit is een morele keuze vastgelegd in code.
              </p>
            </div>
          </div>
        </section>

        {/* 7 Proof Points */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">7 Bewijspunten</h2>
          <p className="text-muted-foreground">
            Elke claim is traceerbaar tot code. Klik om het bewijs te zien.
          </p>
          
          <div className="space-y-3">
            {proofPoints.map((point, index) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPoint(expandedPoint === point.id ? null : point.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    {point.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{point.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{point.claim}</p>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      expandedPoint === point.id ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                <AnimatePresence>
                  {expandedPoint === point.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-2 border-t border-border bg-muted/20 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Bewijs
                          </p>
                          <ul className="space-y-1">
                            {point.evidence.map((e, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{e}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-border space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Code-referenties (verifieerbaar)
                          </p>
                          <div className="space-y-1">
                            {point.codeLinks.map((link, i) => (
                              <a
                                key={i}
                                href={getPermalink(link.file, link.lines)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs hover:text-primary transition-colors group"
                              >
                                <FileCode className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                                  {link.file}{link.lines ? `:${link.lines}` : ''}
                                </code>
                                <span className="text-muted-foreground">— {link.description}</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                              </a>
                            ))}
                          </div>
                          {point.ciGuard && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3" />
                                <span>CI-gate:</span>
                                <code className="bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-mono">
                                  {point.ciGuard}
                                </code>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Operational Clarity - SLOs & Failure Policies */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Operational Clarity</h2>
          </div>
          <p className="text-muted-foreground">
            Werner Vogels-niveau: expliciet, meetbaar, auditeerbaar.
          </p>

          <Tabs defaultValue="slos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="slos" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SLOs
              </TabsTrigger>
              <TabsTrigger value="failures" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Failure Policy
              </TabsTrigger>
              <TabsTrigger value="ci" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                CI-Gates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="slos" className="mt-4">
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Metric</th>
                      <th className="text-left px-4 py-3 font-medium">Target</th>
                      <th className="text-left px-4 py-3 font-medium">Measurement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {operationalClarity.slos.map((slo, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{slo.metric}</td>
                        <td className="px-4 py-3">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono">
                            {slo.target}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                          {slo.measurement}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="failures" className="mt-4">
              <div className="space-y-3">
                {operationalClarity.failurePolicies.map((policy, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 flex items-start gap-4">
                    <div className={`rounded-full p-2 flex-shrink-0 ${
                      policy.action.startsWith('STOP') 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{policy.scenario}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className={`font-mono ${
                          policy.action.startsWith('STOP') 
                            ? 'text-destructive' 
                            : 'text-yellow-600'
                        }`}>
                          {policy.action.split(':')[0]}:
                        </span>
                        {' '}{policy.action.split(':')[1]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Kernprincipe: <span className="font-medium">STOP &gt; GUESS</span> — expliciet falen boven gokken
              </p>
            </TabsContent>

            <TabsContent value="ci" className="mt-4">
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Gate</th>
                      <th className="text-left px-4 py-3 font-medium">Faalt als...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {operationalClarity.ciGates.map((gate, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <code className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-mono">
                            {gate.name}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{gate.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Deze gates breken de build als kerninvarianten worden geschonden
              </p>
            </TabsContent>
          </Tabs>
        </section>

        {/* Summary Table */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Samenvatting</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Claim</th>
                  <th className="text-left px-4 py-3 font-medium">Bewijs-type</th>
                  <th className="text-center px-4 py-3 font-medium">CI-gate</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Wedge werkt zonder uitleg", "Code flow", "wedge-flow-under-60s"],
                  ["Origineel altijd zichtbaar", "UI code", "origin-always-primary"],
                  ["AI kan niets overschrijven", "Type definitions", "no-image-url-mutation"],
                  ["Bij twijfel geen resultaat", "Search logic", "no-fuzzy-search"],
                  ["AI = metadata", "Database schema", "no-ai-entity"],
                  ["Origin onveranderbaar", "Storage + code", "origin-immutable"],
                  ["Geen taxonomie", "Component audit", "no-taxonomy-tables"]
                ].map(([claim, type, gate], i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{claim}</td>
                    <td className="px-4 py-3 text-muted-foreground">{type}</td>
                    <td className="px-4 py-3 text-center">
                      <code className="text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-mono">
                        {gate}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Final Conclusion */}
        <section className="text-center py-12 space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Harde conclusie
            </p>
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-lg text-muted-foreground">
                Het gedrag is geen keuze die bewaakt moet worden.
              </p>
              <p className="text-lg text-muted-foreground">
                Het gedrag is een gevolg van code die geen alternatief toelaat.
              </p>
              <p className="text-2xl font-semibold text-primary">
                Dat is infrastructuur.
              </p>
            </div>
          </motion.div>

          <div className="h-px bg-border max-w-xs mx-auto" />

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto px-4"
          >
            "Umarise is geen product dat belooft waarheid te beschermen.
            <br />
            <span className="text-primary">Het is een systeem dat het onmogelijk maakt om haar te vervangen.</span>"
          </motion.blockquote>
        </section>

        {/* Documentation Link */}
        <section className="text-center pb-8">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Bekijk volledige documentatie: docs/proof-of-behavior.md
          </a>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground space-y-2">
        <p>Document opgesteld: Januari 2026 • Code-referenties gevalideerd tegen: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{COMMIT_SHA}</code></p>
        <p className="text-xs">
          Repository: <a href={REPO_BASE} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">{REPO_BASE}</a>
        </p>
      </footer>
    </div>
  );
}
