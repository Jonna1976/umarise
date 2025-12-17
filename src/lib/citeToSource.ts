/**
 * Cite-to-Source - Highlight matched passages in raw text
 * 
 * Makes retrieval TRACEABLE - users can verify why a page matched.
 * No black box: every match shows the exact passage that triggered it.
 * 
 * Match types:
 * - Cue match: highlight the cue word in text
 * - Entity match: highlight the entity span
 * - Text match: highlight the matched phrase
 * - Meaning match: show likely sentences (heuristic)
 */

export interface HighlightedPassage {
  text: string;
  startIndex: number;
  endIndex: number;
  matchType: 'cue' | 'entity' | 'text' | 'meaning';
  matchedTerm: string;
}

export interface CiteResult {
  passages: HighlightedPassage[];
  // For meaning matches, show top sentences with most overlap
  likelySentences?: string[];
}

/**
 * Find passages in OCR text that match the search terms
 * Returns highlighted passages with their positions
 */
export function findMatchedPassages(
  ocrText: string,
  matchedTerms: string[],
  matchTypes: Array<'cue' | 'text' | 'entity' | 'meaning'>
): CiteResult {
  if (!ocrText || matchedTerms.length === 0) {
    return { passages: [] };
  }

  const passages: HighlightedPassage[] = [];
  const textLower = ocrText.toLowerCase();

  // Process each matched term
  for (let i = 0; i < matchedTerms.length; i++) {
    const term = matchedTerms[i];
    const termLower = term.toLowerCase();
    const matchType = matchTypes[i] || matchTypes[0] || 'text';

    // For meaning matches, find likely sentences instead of exact matches
    if (matchType === 'meaning') {
      continue; // Handle separately below
    }

    // Find all occurrences of the term in the text
    let searchIndex = 0;
    while (true) {
      const foundIndex = textLower.indexOf(termLower, searchIndex);
      if (foundIndex === -1) break;

      // Check if it's a word boundary match (not part of a larger word)
      const beforeChar = foundIndex > 0 ? ocrText[foundIndex - 1] : ' ';
      const afterChar = foundIndex + term.length < ocrText.length 
        ? ocrText[foundIndex + term.length] 
        : ' ';
      
      const isWordBoundary = /\W/.test(beforeChar) && /\W/.test(afterChar);
      
      if (isWordBoundary || term.length >= 4) { // Allow partial matches for longer terms
        // Avoid duplicate passages
        const isDuplicate = passages.some(
          p => p.startIndex === foundIndex && p.endIndex === foundIndex + term.length
        );

        if (!isDuplicate) {
          passages.push({
            text: ocrText.slice(foundIndex, foundIndex + term.length),
            startIndex: foundIndex,
            endIndex: foundIndex + term.length,
            matchType,
            matchedTerm: term,
          });
        }
      }

      searchIndex = foundIndex + 1;
    }
  }

  // Sort by position in text
  passages.sort((a, b) => a.startIndex - b.startIndex);

  // Handle meaning matches - find likely sentences
  const hasMeaningMatch = matchTypes.includes('meaning');
  let likelySentences: string[] | undefined;

  if (hasMeaningMatch && passages.length === 0) {
    // Split into sentences and find ones with most term overlap
    const sentences = splitIntoSentences(ocrText);
    const scoredSentences = sentences.map(sentence => {
      const sentenceLower = sentence.toLowerCase();
      let score = 0;
      for (const term of matchedTerms) {
        if (sentenceLower.includes(term.toLowerCase())) {
          score += 1;
        }
      }
      return { sentence, score };
    });

    // Get top 2 sentences with any overlap
    likelySentences = scoredSentences
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(s => s.sentence);
  }

  return { passages, likelySentences };
}

/**
 * Split text into sentences (simple heuristic)
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or newline
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short fragments
}

/**
 * Generate highlighted HTML for displaying matched text
 * Returns segments with highlight flags
 */
export interface TextSegment {
  text: string;
  isHighlighted: boolean;
  matchType?: 'cue' | 'entity' | 'text' | 'meaning';
  matchedTerm?: string;
}

export function generateHighlightedSegments(
  ocrText: string,
  passages: HighlightedPassage[]
): TextSegment[] {
  if (passages.length === 0) {
    return [{ text: ocrText, isHighlighted: false }];
  }

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  // Merge overlapping passages
  const mergedPassages = mergeOverlappingPassages(passages);

  for (const passage of mergedPassages) {
    // Add non-highlighted text before this passage
    if (passage.startIndex > lastIndex) {
      segments.push({
        text: ocrText.slice(lastIndex, passage.startIndex),
        isHighlighted: false,
      });
    }

    // Add highlighted passage
    segments.push({
      text: ocrText.slice(passage.startIndex, passage.endIndex),
      isHighlighted: true,
      matchType: passage.matchType,
      matchedTerm: passage.matchedTerm,
    });

    lastIndex = passage.endIndex;
  }

  // Add remaining text after last passage
  if (lastIndex < ocrText.length) {
    segments.push({
      text: ocrText.slice(lastIndex),
      isHighlighted: false,
    });
  }

  return segments;
}

/**
 * Merge overlapping passages to avoid highlight conflicts
 */
function mergeOverlappingPassages(passages: HighlightedPassage[]): HighlightedPassage[] {
  if (passages.length <= 1) return passages;

  const sorted = [...passages].sort((a, b) => a.startIndex - b.startIndex);
  const merged: HighlightedPassage[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.startIndex <= last.endIndex) {
      // Overlapping - extend the previous passage
      last.endIndex = Math.max(last.endIndex, current.endIndex);
      last.text = ''; // Will be regenerated from indices
    } else {
      merged.push(current);
    }
  }

  return merged;
}
