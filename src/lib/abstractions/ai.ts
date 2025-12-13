/**
 * Umarise Abstraction Layer - AI Interface
 * 
 * Defines the contract for all AI operations.
 * Current implementation: Lovable AI (Gemini via gateway)
 * Future implementation: Hetzner (BERT, Whisper, Ollama)
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

// ============= Future Hetzner Implementation (Placeholder) =============

export class HetznerAIProvider implements IAIProvider {
  constructor(private config: { 
    bertEndpoint: string;   // BERT for embeddings/text analysis
    whisperEndpoint: string; // Whisper for audio (future)
    spacyEndpoint: string;  // SpaCy for NLP
    ollamaEndpoint: string; // Ollama for LLM
  }) {}

  async analyzePage(_imageBase64: string): Promise<PageAnalysisResult> {
    // Future: Use local BERT for embeddings + Ollama for text generation
    // Benefits: Zero cloud dependency, data sovereignty, predictable costs
    throw new Error('Hetzner AI not yet implemented');
  }

  async analyzePatterns(_pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>): Promise<PatternAnalysisResult> {
    // Future: Use BERT embeddings + Ollama for pattern synthesis
    throw new Error('Hetzner AI not yet implemented');
  }

  async analyzePersonality(
    _pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>,
    _profileType: 'voice' | 'influence'
  ): Promise<PersonalityAnalysisResult> {
    // Future: Use Ollama LLM with custom personality prompts
    throw new Error('Hetzner AI not yet implemented');
  }

  async generateYearReflection(
    _year: number,
    _pages: Array<{ summary: string; tone: string; keywords: string[]; createdAt: Date }>
  ): Promise<YearReflectionResult> {
    throw new Error('Hetzner AI not yet implemented');
  }

  async generateRecommendations(
    _personality: PersonalityAnalysisResult
  ): Promise<Array<{ type: string; title: string; reason: string }>> {
    throw new Error('Hetzner AI not yet implemented');
  }
}
