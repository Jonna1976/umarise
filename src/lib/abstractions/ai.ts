/**
 * Umarise Abstraction Layer - AI Interface
 * 
 * Defines the contract for all AI operations.
 * Both implementations use Google Gemini 2.5 Flash:
 * - LovableAIProvider: via Lovable AI Gateway (Supabase edge functions)
 * - HetznerAIProvider: via Hetzner Vision Service (vault.umarise.com)
 */

import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '../deviceId';
import type { 
  PageAnalysisResult, 
  PatternAnalysisResult, 
  PersonalityAnalysisResult,
  YearReflectionResult,
  AIError 
} from './types';

// ============= AI Interface =============

export interface IAIProvider {
  // Page analysis (OCR + summary + tone + keywords)
  analyzePage(imageBase64: string): Promise<PageAnalysisResult>;
  
  // Pattern detection across pages
  analyzePatterns(pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>): Promise<PatternAnalysisResult>;
  
  // Personality profile generation
  analyzePersonality(pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>, profileType: 'voice' | 'influence'): Promise<PersonalityAnalysisResult>;
  
  // Year reflection generation
  generateYearReflection(year: number, pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>): Promise<YearReflectionResult>;
  
  // Recommendations based on personality
  generateRecommendations(personality: PersonalityAnalysisResult): Promise<Array<{ type: string; title: string; reason: string }>>;
  
  // Semantic search across pages (optional - not all providers support this)
  searchPages?(query: string, options?: { timeFilter?: { after?: Date; before?: Date }; limit?: number }): Promise<Array<{ pageId: string; score: number; matchTypes: string[]; matchedTerms: string[] }>>;
}

// ============= Lovable AI Implementation =============

export class LovableAIProvider implements IAIProvider {
  private maxRetries = 3;

  async analyzePage(imageBase64: string): Promise<PageAnalysisResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`AI analysis attempt ${attempt}/${this.maxRetries}...`);
        
        const { data, error } = await supabase.functions.invoke('analyze-page', {
          body: { image_base64: imageBase64 },
        });

        if (error) {
          if (error.message?.includes('429')) {
            throw Object.assign(new Error('Rate limit exceeded. Please wait a moment and try again.'), { code: 'RATE_LIMITED' });
          }
          if (error.message?.includes('402')) {
            throw Object.assign(new Error('AI credits depleted. Please add credits.'), { code: 'CREDITS_DEPLETED' });
          }
          throw error;
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        return data as PageAnalysisResult;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        console.warn(`Analysis attempt ${attempt} failed:`, lastError.message);
        
        // Don't retry on user-facing errors
        if ((err as { code?: string }).code === 'RATE_LIMITED' || (err as { code?: string }).code === 'CREDITS_DEPLETED') {
          throw lastError;
        }
        
        // Wait before retry with exponential backoff
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to analyze image after multiple attempts');
  }

  async analyzePatterns(pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>): Promise<PatternAnalysisResult> {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) throw new Error('Device ID not initialized');

    const { data, error } = await supabase.functions.invoke('analyze-patterns', {
      body: { 
        device_user_id: deviceUserId,
        pages: pages.map(p => ({
          summary: p.summary,
          tone: p.tone,
          keywords: p.keywords,
          created_at: p.createdAt.toISOString(),
        })),
      },
    });

    if (error) throw new Error(error.message || 'Pattern analysis failed');
    if (data?.error) throw new Error(data.error);

    return data as PatternAnalysisResult;
  }

  async analyzePersonality(
    pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>, 
    profileType: 'voice' | 'influence'
  ): Promise<PersonalityAnalysisResult> {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) throw new Error('Device ID not initialized');

    const { data, error } = await supabase.functions.invoke('analyze-personality', {
      body: { 
        device_user_id: deviceUserId,
        profile_type: profileType,
        pages: pages.map(p => ({
          summary: p.summary,
          tone: p.tone,
          keywords: p.keywords,
          created_at: p.createdAt.toISOString(),
        })),
      },
    });

    if (error) throw new Error(error.message || 'Personality analysis failed');
    if (data?.error) throw new Error(data.error);

    return data as PersonalityAnalysisResult;
  }

  async generateYearReflection(
    year: number, 
    pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>
  ): Promise<YearReflectionResult> {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) throw new Error('Device ID not initialized');

    const { data, error } = await supabase.functions.invoke('generate-year-reflection', {
      body: { 
        device_user_id: deviceUserId,
        year,
        pages: pages.map(p => ({
          summary: p.summary,
          tone: p.tone,
          keywords: p.keywords,
          created_at: p.createdAt.toISOString(),
        })),
      },
    });

    if (error) throw new Error(error.message || 'Year reflection failed');
    if (data?.error) throw new Error(data.error);

    return data as YearReflectionResult;
  }

  async generateRecommendations(
    personality: PersonalityAnalysisResult
  ): Promise<Array<{ type: string; title: string; reason: string }>> {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) throw new Error('Device ID not initialized');

    const { data, error } = await supabase.functions.invoke('generate-recommendations', {
      body: { 
        device_user_id: deviceUserId,
        personality,
      },
    });

    if (error) throw new Error(error.message || 'Recommendations failed');
    if (data?.error) throw new Error(data.error);

    return data.recommendations || [];
  }
}

// ============= Hetzner AI Implementation (Gemini 2.5 Flash via Vision Service) =============

export class HetznerAIProvider implements IAIProvider {
  private maxRetries = 3;

  constructor(private config: { 
    bertEndpoint: string;   // BERT for embeddings (future)
    whisperEndpoint: string; // Whisper for audio (future)
    spacyEndpoint: string;  // SpaCy for NLP (future)
    ollamaEndpoint: string; // Not used - Hetzner uses Gemini 2.5 Flash
  }) {
    // No fallback needed - Hetzner Vision Service uses same Gemini 2.5 Flash as Lovable AI
  }

  /**
   * Call Hetzner AI via Supabase edge function proxy to avoid CORS issues
   */
  private async callHetznerProxy(endpoint: string, payload: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.functions.invoke('hetzner-ai-proxy', {
      body: { endpoint, payload },
    });

    if (error) {
      throw new Error(error.message || 'Hetzner proxy call failed');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }

  async analyzePage(imageBase64: string): Promise<PageAnalysisResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[Hetzner AI] Analysis attempt ${attempt}/${this.maxRetries} via Gemini 2.5 Flash...`);
        
        const data = await this.callHetznerProxy('/ai/analyze-page', { imageBase64 }) as PageAnalysisResult;
        
        console.log(`[Hetzner AI] Analysis complete`);
        return data;
        
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        console.warn(`[Hetzner AI] Attempt ${attempt} failed:`, lastError.message);
        
        if ((err as { code?: string }).code === 'RATE_LIMITED') {
          throw Object.assign(new Error('Rate limit exceeded. Please wait a moment and try again.'), { code: 'RATE_LIMITED' });
        }
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to analyze image after multiple attempts');
  }

  async analyzePatterns(
    pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>
  ): Promise<PatternAnalysisResult> {
    const data = await this.callHetznerProxy('/ai/analyze-patterns', {
      pages: pages.map(p => ({
        summary: p.summary,
        tone: p.tone,
        keywords: p.keywords,
        createdAt: p.createdAt.toISOString(),
      })),
    });
    return data as PatternAnalysisResult;
  }

  async analyzePersonality(
    pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>,
    profileType: 'voice' | 'influence'
  ): Promise<PersonalityAnalysisResult> {
    const data = await this.callHetznerProxy('/ai/analyze-personality', {
      pages: pages.map(p => ({
        summary: p.summary,
        tone: p.tone,
        keywords: p.keywords,
        createdAt: p.createdAt.toISOString(),
      })),
      profileType,
    });
    return data as PersonalityAnalysisResult;
  }

  async generateYearReflection(
    year: number,
    pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>
  ): Promise<YearReflectionResult> {
    const data = await this.callHetznerProxy('/ai/generate-year-reflection', {
      year,
      pages: pages.map(p => ({
        summary: p.summary,
        tone: p.tone,
        keywords: p.keywords,
        createdAt: p.createdAt.toISOString(),
      })),
    });
    return data as YearReflectionResult;
  }

  async generateRecommendations(
    personality: PersonalityAnalysisResult
  ): Promise<Array<{ type: string; title: string; reason: string }>> {
    const data = await this.callHetznerProxy('/ai/generate-recommendations', { personality }) as { recommendations?: Array<{ type: string; title: string; reason: string }> };
    return data.recommendations || [];
  }

  /**
   * Semantic search across pages using Hetzner Codex service
   * Endpoint: POST /api/codex/ai/search
   */
  async searchPages(
    query: string,
    options?: { timeFilter?: { after?: Date; before?: Date }; limit?: number }
  ): Promise<Array<{ pageId: string; score: number; matchTypes: string[]; matchedTerms: string[] }>> {
    try {
      console.log(`[Hetzner AI] Searching pages for: "${query}"`);
      
      const payload: Record<string, unknown> = {
        query,
        deviceUserId: getDeviceId(),
        limit: options?.limit || 20,
      };
      
      if (options?.timeFilter?.after) {
        payload.afterDate = options.timeFilter.after.toISOString();
      }
      if (options?.timeFilter?.before) {
        payload.beforeDate = options.timeFilter.before.toISOString();
      }
      
      // Call the codex search endpoint (routed via proxy)
      const data = await this.callHetznerProxy('/ai/search', payload) as {
        success?: boolean;
        count?: number;
        results?: Array<{
          id: string;           // pageId in backend format
          matchType: string;    // single matchType in backend format
          ocrText?: string;
          score: number;
          summary?: string;
        }>;
      };
      
      if (!data.success || !data.results) {
        console.log(`[Hetzner AI] Search returned no results`);
        return [];
      }
      
      console.log(`[Hetzner AI] Search found ${data.count} results`);
      
      // Map backend response format to frontend expected format
      return data.results.map(r => ({
        pageId: r.id,
        score: r.score,
        matchTypes: [r.matchType],      // Backend returns single matchType, wrap in array
        matchedTerms: [query],          // Backend doesn't return matched terms, use query
      }));
    } catch (err) {
      console.error(`[Hetzner AI] Search failed:`, err);
      // Return empty array on failure - local search will be used as fallback
      return [];
    }
  }
}
