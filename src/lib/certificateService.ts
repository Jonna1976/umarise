/**
 * Certificate Service for Umarise v4
 * 
 * Generates PDF certificates for marks using jsPDF.
 * Client-side only - no server involvement.
 * 
 * Certificate includes:
 * - Thumbnail (embedded)
 * - Origin ID
 * - Timestamp
 * - SHA-256 fingerprint
 * - Masked email (m***r@email.com)
 * - OTS proof status
 * - Witness confirmation (if present)
 */

import { jsPDF } from 'jspdf';

export interface CertificateData {
  originId: string;
  hash: string;
  timestamp: Date;
  thumbnailDataUrl?: string;
  email?: string;
  otsStatus: 'pending' | 'submitted' | 'anchored';
  otsProof?: Uint8Array;
  bitcoinBlockHeight?: number;
  witness?: {
    email: string;
    confirmedAt: Date;
    confirmationHash: string;
  };
}

// ============= Email Masking =============

/**
 * Mask email address for privacy
 * john.doe@example.com → j***e@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}***${last}@${domain}`;
}

// ============= Certificate Generation =============

/**
 * Generate a PDF certificate for a mark
 */
export async function generateCertificate(data: CertificateData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;
  
  // Background color (dark ritual surface)
  doc.setFillColor(20, 25, 20);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Gold color for text
  const goldColor = { r: 190, g: 165, b: 110 };
  const mutedGold = { r: 150, g: 130, b: 90 };
  const cream = { r: 240, g: 235, b: 220 };
  
  // Header
  doc.setTextColor(goldColor.r, goldColor.g, goldColor.b);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificate of Beginning', pageWidth / 2, y + 15, { align: 'center' });
  y += 30;
  
  // Umarise logo/symbol
  doc.setFontSize(36);
  doc.text('U', pageWidth / 2, y + 10, { align: 'center' });
  y += 25;
  
  // Divider line
  doc.setDrawColor(goldColor.r, goldColor.g, goldColor.b);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 30, y, pageWidth / 2 + 30, y);
  y += 15;
  
  // Thumbnail (if provided)
  if (data.thumbnailDataUrl) {
    try {
      const imgWidth = 60;
      const imgHeight = 60;
      const imgX = (pageWidth - imgWidth) / 2;
      
      doc.addImage(data.thumbnailDataUrl, 'JPEG', imgX, y, imgWidth, imgHeight);
      y += imgHeight + 15;
    } catch (e) {
      console.warn('[Certificate] Failed to embed thumbnail:', e);
      y += 10;
    }
  }
  
  // Origin ID
  doc.setTextColor(goldColor.r, goldColor.g, goldColor.b);
  doc.setFontSize(10);
  doc.setFont('courier', 'normal');
  doc.text('ORIGIN', pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setFontSize(16);
  doc.text(data.originId.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(mutedGold.r, mutedGold.g, mutedGold.b);
  doc.text('SEALED', pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setFontSize(12);
  doc.setTextColor(cream.r, cream.g, cream.b);
  const formattedDate = data.timestamp.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ' at ' + data.timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(formattedDate, pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // SHA-256 Fingerprint
  doc.setFontSize(10);
  doc.setTextColor(mutedGold.r, mutedGold.g, mutedGold.b);
  doc.text('FINGERPRINT (SHA-256)', pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setTextColor(cream.r, cream.g, cream.b);
  
  // Split hash into two lines for readability
  const hash1 = data.hash.substring(0, 32);
  const hash2 = data.hash.substring(32, 64);
  doc.text(hash1, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(hash2, pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Divider
  doc.setDrawColor(mutedGold.r, mutedGold.g, mutedGold.b);
  doc.setLineWidth(0.2);
  doc.line(margin + 20, y, pageWidth - margin - 20, y);
  y += 12;
  
  // OTS Status
  doc.setFontSize(10);
  doc.setTextColor(mutedGold.r, mutedGold.g, mutedGold.b);
  doc.text('BITCOIN ANCHOR', pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setFontSize(11);
  let otsText: string;
  switch (data.otsStatus) {
    case 'anchored':
      otsText = data.bitcoinBlockHeight 
        ? `Anchored in block ${data.bitcoinBlockHeight}`
        : 'Anchored on Bitcoin blockchain';
      break;
    case 'submitted':
      otsText = 'Pending confirmation (~24 hours)';
      break;
    default:
      otsText = 'Awaiting submission';
  }
  doc.setTextColor(cream.r, cream.g, cream.b);
  doc.text(otsText, pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Maker (masked email)
  if (data.email) {
    doc.setFontSize(10);
    doc.setTextColor(mutedGold.r, mutedGold.g, mutedGold.b);
    doc.text('MAKER', pageWidth / 2, y, { align: 'center' });
    y += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(cream.r, cream.g, cream.b);
    doc.text(maskEmail(data.email), pageWidth / 2, y, { align: 'center' });
    y += 15;
  }
  
  // Witness (if present)
  if (data.witness) {
    doc.setDrawColor(mutedGold.r, mutedGold.g, mutedGold.b);
    doc.setLineWidth(0.2);
    doc.line(margin + 30, y, pageWidth - margin - 30, y);
    y += 12;
    
    doc.setFontSize(10);
    doc.setTextColor(mutedGold.r, mutedGold.g, mutedGold.b);
    doc.text('WITNESSED BY', pageWidth / 2, y, { align: 'center' });
    y += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(cream.r, cream.g, cream.b);
    doc.text(maskEmail(data.witness.email), pageWidth / 2, y, { align: 'center' });
    y += 6;
    
    doc.setFontSize(9);
    doc.setTextColor(mutedGold.r, mutedGold.g, mutedGold.b);
    const witnessDate = data.witness.confirmedAt.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Confirmed ${witnessDate}`, pageWidth / 2, y, { align: 'center' });
    y += 15;
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(mutedGold.r, mutedGold.g, mutedGold.b);
  doc.setFont('helvetica', 'italic');
  doc.text('sealed on your device · only the proof leaves', pageWidth / 2, pageHeight - margin - 10, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text('Verify at umarise.com/verify', pageWidth / 2, pageHeight - margin - 5, { align: 'center' });
  
  // Generate blob
  return doc.output('blob');
}

/**
 * Download a certificate as PDF
 */
export async function downloadCertificate(data: CertificateData): Promise<void> {
  const blob = await generateCertificate(data);
  const url = URL.createObjectURL(blob);
  
  const filename = `umarise-certificate-${data.originId}.pdf`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate certificates for multiple marks and download as ZIP
 */
export async function downloadAllCertificates(marks: CertificateData[]): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  for (const mark of marks) {
    try {
      const blob = await generateCertificate(mark);
      const filename = `certificate-${mark.originId}.pdf`;
      zip.file(filename, blob);
    } catch (e) {
      console.warn(`[Certificate] Failed to generate for ${mark.originId}:`, e);
    }
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `umarise-certificates-${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
