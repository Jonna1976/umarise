// Page service for Supabase operations - replaces mockData for real persistence

import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from './deviceId';

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
  confidenceScore?: number;
  capsuleId?: string;
  pageOrder?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CapsulePages {
  capsuleId: string;
  pages: Page[];
}

interface AnalysisResult {
  ocr_text: string;
  summary: string;
  tone: string;
  keywords: string[];
}

// Upload image to Supabase Storage
async function uploadImage(imageDataUrl: string, deviceUserId: string): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${deviceUserId}/${timestamp}.jpg`;
  
  // Upload to storage
  const { data, error } = await supabase.storage
    .from('page-images')
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('page-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Extract base64 from data URL
function extractBase64(dataUrl: string): string {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (base64Match) {
    return base64Match[1];
  }
  // If no prefix, assume it's already base64
  return dataUrl;
}

// Analyze image using AI edge function
async function analyzeImage(imageDataUrl: string): Promise<AnalysisResult> {
  // Send base64 directly to edge function (more reliable than URL)
  const base64 = extractBase64(imageDataUrl);
  
  const { data, error } = await supabase.functions.invoke('analyze-page', {
    body: { image_base64: base64 },
  });

  if (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze image');
  }

  return data as AnalysisResult;
}

// Add a page to an existing capsule
export async function addToCapsule(imageDataUrl: string, capsuleId: string): Promise<Page> {
  // Get the current max page_order for this capsule
  const { data: existingPages, error: fetchError } = await supabase
    .from('pages')
    .select('page_order')
    .eq('capsule_id', capsuleId)
    .order('page_order', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error('Error fetching capsule pages:', fetchError);
    throw new Error('Failed to fetch capsule pages');
  }

  const nextOrder = existingPages && existingPages.length > 0 
    ? (existingPages[0].page_order ?? 0) + 1 
    : 0;

  return createPage(imageDataUrl, capsuleId, nextOrder);
}

// Create a new page with image upload and AI analysis
export async function createPage(
  imageDataUrl: string, 
  capsuleId?: string, 
  pageOrder?: number
): Promise<Page> {
  const deviceUserId = getDeviceId();
  
  if (!deviceUserId) {
    throw new Error('Device ID not initialized');
  }

  // Step 1: Analyze with AI (using base64 for reliability)
  console.log('Analyzing image with AI...');
  const analysis = await analyzeImage(imageDataUrl);
  console.log('Analysis complete:', analysis);

  // Step 2: Upload image to storage
  console.log('Uploading image...');
  const imageUrl = await uploadImage(imageDataUrl, deviceUserId);
  console.log('Image uploaded:', imageUrl);

  // Step 3: Parse tone (can be comma-separated or single value)
  const toneArray = analysis.tone
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);

  // Step 4: Insert into database
  const { data, error } = await supabase
    .from('pages')
    .insert({
      device_user_id: deviceUserId,
      image_url: imageUrl,
      ocr_text: analysis.ocr_text,
      summary: analysis.summary,
      tone: toneArray[0] || 'reflective', // Store primary tone
      keywords: analysis.keywords,
      capsule_id: capsuleId || null,
      page_order: pageOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Database insert error:', error);
    throw new Error('Failed to save page');
  }

  // Return formatted page
  return {
    id: data.id,
    deviceUserId: data.device_user_id,
    imageUrl: data.image_url,
    ocrText: data.ocr_text || '',
    summary: data.summary || '',
    tone: toneArray,
    keywords: data.keywords || [],
    primaryKeyword: data.primary_keyword || undefined,
    userNote: data.user_note || undefined,
    confidenceScore: data.confidence_score ? Number(data.confidence_score) : undefined,
    capsuleId: data.capsule_id || undefined,
    pageOrder: data.page_order ?? 0,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  };
}

// Create a capsule from multiple images
export async function createCapsule(imageDataUrls: string[]): Promise<Page[]> {
  if (imageDataUrls.length === 0) {
    throw new Error('No images provided');
  }

  // Generate a capsule ID
  const capsuleId = crypto.randomUUID();
  const pages: Page[] = [];

  // Process each image in order
  for (let i = 0; i < imageDataUrls.length; i++) {
    console.log(`Processing image ${i + 1} of ${imageDataUrls.length}...`);
    const page = await createPage(imageDataUrls[i], capsuleId, i);
    pages.push(page);
  }

  return pages;
}

// Get all pages for current device
export async function getPages(): Promise<Page[]> {
  const deviceUserId = getDeviceId();
  
  if (!deviceUserId) {
    return [];
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('device_user_id', deviceUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch pages error:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    deviceUserId: row.device_user_id,
    imageUrl: row.image_url,
    ocrText: row.ocr_text || '',
    summary: row.summary || '',
    tone: row.tone ? [row.tone] : [],
    keywords: row.keywords || [],
    primaryKeyword: row.primary_keyword || undefined,
    userNote: row.user_note || undefined,
    confidenceScore: row.confidence_score ? Number(row.confidence_score) : undefined,
    capsuleId: row.capsule_id || undefined,
    pageOrder: row.page_order ?? 0,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  }));
}

// Get pages grouped by capsule
export function groupPagesByCapsule(pages: Page[]): { standalone: Page[]; capsules: CapsulePages[] } {
  const standalone: Page[] = [];
  const capsuleMap = new Map<string, Page[]>();

  for (const page of pages) {
    if (page.capsuleId) {
      const existing = capsuleMap.get(page.capsuleId) || [];
      existing.push(page);
      capsuleMap.set(page.capsuleId, existing);
    } else {
      standalone.push(page);
    }
  }

  // Sort pages within each capsule by order
  const capsules: CapsulePages[] = [];
  for (const [capsuleId, capsulePages] of capsuleMap) {
    capsulePages.sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0));
    capsules.push({ capsuleId, pages: capsulePages });
  }

  return { standalone, capsules };
}

// Get single page by ID
export async function getPage(id: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('Fetch page error:', error);
    return null;
  }

  return {
    id: data.id,
    deviceUserId: data.device_user_id,
    imageUrl: data.image_url,
    ocrText: data.ocr_text || '',
    summary: data.summary || '',
    tone: data.tone ? [data.tone] : [],
    keywords: data.keywords || [],
    primaryKeyword: data.primary_keyword || undefined,
    userNote: data.user_note || undefined,
    confidenceScore: data.confidence_score ? Number(data.confidence_score) : undefined,
    capsuleId: data.capsule_id || undefined,
    pageOrder: data.page_order ?? 0,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  };
}

// Get all pages in a capsule
export async function getCapsulePages(capsuleId: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('capsule_id', capsuleId)
    .order('page_order', { ascending: true });

  if (error || !data) {
    console.error('Fetch capsule pages error:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    deviceUserId: row.device_user_id,
    imageUrl: row.image_url,
    ocrText: row.ocr_text || '',
    summary: row.summary || '',
    tone: row.tone ? [row.tone] : [],
    keywords: row.keywords || [],
    primaryKeyword: row.primary_keyword || undefined,
    userNote: row.user_note || undefined,
    confidenceScore: row.confidence_score ? Number(row.confidence_score) : undefined,
    capsuleId: row.capsule_id || undefined,
    pageOrder: row.page_order ?? 0,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  }));
}

// Delete a page
export async function deletePage(id: string): Promise<boolean> {
  const deviceUserId = getDeviceId();
  
  if (!deviceUserId) {
    return false;
  }

  // First get the page to delete the image
  const page = await getPage(id);
  
  if (page) {
    // Extract filename from URL and delete from storage
    try {
      const url = new URL(page.imageUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts.slice(-2).join('/'); // deviceUserId/timestamp.jpg
      
      await supabase.storage
        .from('page-images')
        .remove([filename]);
    } catch (e) {
      console.warn('Failed to delete image from storage:', e);
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
    .eq('device_user_id', deviceUserId);

  if (error) {
    console.error('Delete page error:', error);
    return false;
  }

  return true;
}

// Update page with user note and primary keyword
export async function updatePage(
  id: string, 
  updates: { userNote?: string; primaryKeyword?: string }
): Promise<boolean> {
  const deviceUserId = getDeviceId();
  
  if (!deviceUserId) {
    return false;
  }

  const { error } = await supabase
    .from('pages')
    .update({
      user_note: updates.userNote,
      primary_keyword: updates.primaryKeyword,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('device_user_id', deviceUserId);

  if (error) {
    console.error('Update page error:', error);
    return false;
  }

  return true;
}

// Check for duplicate image by comparing OCR text similarity
export async function checkDuplicate(ocrText: string): Promise<Page | null> {
  const deviceUserId = getDeviceId();
  
  if (!deviceUserId || !ocrText || ocrText.length < 50) {
    return null;
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('device_user_id', deviceUserId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    return null;
  }

  // Simple similarity check: compare first 200 chars of OCR text
  const normalizedNew = ocrText.slice(0, 200).toLowerCase().replace(/\s+/g, ' ').trim();
  
  for (const row of data) {
    if (!row.ocr_text) continue;
    const normalizedExisting = row.ocr_text.slice(0, 200).toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Check if texts are very similar (>80% match)
    const similarity = calculateSimilarity(normalizedNew, normalizedExisting);
    if (similarity > 0.8) {
      return {
        id: row.id,
        deviceUserId: row.device_user_id,
        imageUrl: row.image_url,
        ocrText: row.ocr_text || '',
        summary: row.summary || '',
        tone: row.tone ? [row.tone] : [],
        keywords: row.keywords || [],
        primaryKeyword: row.primary_keyword || undefined,
        userNote: row.user_note || undefined,
        confidenceScore: row.confidence_score ? Number(row.confidence_score) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      };
    }
  }

  return null;
}

// Simple Levenshtein-based similarity
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  // Simple overlap check
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));
  const intersection = [...words1].filter(w => words2.has(w));
  
  return intersection.length / Math.max(words1.size, words2.size);
}
