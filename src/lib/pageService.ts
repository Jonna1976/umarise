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
  confidenceScore?: number;
  createdAt: Date;
  updatedAt?: Date;
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

// Create a new page with image upload and AI analysis
export async function createPage(imageDataUrl: string): Promise<Page> {
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
    confidenceScore: data.confidence_score ? Number(data.confidence_score) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  };
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
    confidenceScore: row.confidence_score ? Number(row.confidence_score) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  }));
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
    confidenceScore: data.confidence_score ? Number(data.confidence_score) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  };
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
