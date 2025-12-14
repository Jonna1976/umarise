/**
 * Umarise Abstraction Layer - Shared Types
 * 
 * These types define the contract between the frontend and any backend implementation.
 * Current: Lovable Cloud (Supabase)
 * Future: Hetzner Stack (BERT, Vault, IPFS)
 */

// ============= Core Data Types =============

export interface Page {
  id: string;
  deviceUserId: string;
  imageUrl: string;
  ocrText: string;
  summary: string;
  tone: string[];
  keywords: string[];
  primaryKeyword?: string;
  userNote?: string;
  sources?: string[];
  confidenceScore?: number;
  capsuleId?: string;
  pageOrder?: number;
  projectId?: string;
  futureYouCue?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Project {
  id: string;
  deviceUserId: string;
  name: string;
  createdAt: Date;
}

export interface CapsulePages {
  capsuleId: string;
  pages: Page[];
}

export interface PersonalitySnapshot {
  id: string;
  deviceUserId: string;
  tagline: string;
  coreIdentity: string;
  superpower: string;
  growthEdge: string;
  drivers: Array<{ name: string; strength: number }>;
  tensionField: { pole1: string; pole2: string; position: number };
  pageCount: number;
  profileType: 'voice' | 'influence';
  createdAt: Date;
}

// ============= AI Analysis Types =============

export interface PageAnalysisResult {
  ocr_text: string;
  summary: string;
  tone: string;
  keywords: string[];
}

export interface PatternAnalysisResult {
  patterns: Array<{
    theme: string;
    keywords: string[];
    frequency: number;
  }>;
  insights: string[];
}

export interface PersonalityAnalysisResult {
  tagline: string;
  core_identity: string;
  superpower: string;
  growth_edge: string;
  drivers: Array<{ name: string; strength: number }>;
  tension_field: { pole1: string; pole2: string; position: number };
}

export interface YearReflectionResult {
  year_theme: string;
  core_insight: string;
  monthly_data: Array<{
    month: number;
    dominant_tone: string;
    highlight: string;
    page_count: number;
  }>;
  emotional_timeline: Array<{
    month: number;
    tone: string;
    intensity: number;
  }>;
  highlights: string[];
  growth_observation: string;
  top_keywords: string[];
}

// ============= Backend Configuration =============

export type BackendProvider = 'lovable-cloud' | 'hetzner';

export interface BackendConfig {
  provider: BackendProvider;
  // Lovable Cloud config (current)
  supabaseUrl?: string;
  supabaseKey?: string;
  // Hetzner config (future)
  hetznerApiUrl?: string;
  vaultEndpoint?: string;
  aiEndpoint?: string;
  ipfsGateway?: string;
}

// ============= Error Types =============

export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'UPLOAD_FAILED' | 'FETCH_FAILED' | 'DELETE_FAILED' | 'NOT_FOUND' | 'UNAUTHORIZED'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: 'ANALYSIS_FAILED' | 'RATE_LIMITED' | 'CREDITS_DEPLETED' | 'SERVICE_UNAVAILABLE'
  ) {
    super(message);
    this.name = 'AIError';
  }
}
