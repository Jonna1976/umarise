// Mock data for development - will be replaced with real API calls

export interface Page {
  id: string;
  deviceUserId: string;
  imageUrl: string;
  ocrText: string;
  summary: string;
  tone: string[];
  keywords: string[];
  createdAt: Date;
}

export const mockPages: Page[] = [
  {
    id: '1',
    deviceUserId: 'mock-device',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop',
    ocrText: 'The product needs to feel like opening a leather journal. Not another tech app. Something warm, something that invites you to write more, not less. The camera should feel like a ritual, not a task.',
    summary: 'Exploring the emotional design of the product — it should feel like a treasured journal, not a cold tech tool. The camera capture should be ritualistic.',
    tone: ['reflective', 'focused'],
    keywords: ['design', 'emotion', 'ritual', 'journal', 'warmth'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: '2',
    deviceUserId: 'mock-device',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=600&fit=crop',
    ocrText: 'Three things I keep coming back to: 1) simplicity over features, 2) privacy as a feature, 3) the notebook stays primary. We mirror, we dont replace.',
    summary: 'Core principles crystallizing: simplicity, privacy-first, and the analog notebook remains the hero. Umarise mirrors rather than replaces.',
    tone: ['focused', 'hopeful'],
    keywords: ['principles', 'simplicity', 'privacy', 'notebook', 'mirror'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: '3',
    deviceUserId: 'mock-device',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=600&fit=crop',
    ocrText: 'Feeling overwhelmed by the scope. So many features we could build. Need to focus. MVP = capture, snapshot, history. Nothing more. Patterns and threads come later.',
    summary: 'Moment of overwhelm about scope, but finding clarity: MVP must be ruthlessly simple — just capture, snapshot, and history.',
    tone: ['overwhelmed', 'focused'],
    keywords: ['MVP', 'scope', 'focus', 'overwhelm', 'clarity'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: '4',
    deviceUserId: 'mock-device',
    imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=600&fit=crop',
    ocrText: 'Da Vinci never needed an app. He had his notebooks. But what if he could see patterns across 50 years of notebooks? What if he could search his own mind?',
    summary: 'Philosophical musing on Da Vinci and the value of pattern recognition across years of personal notes — searching ones own mind.',
    tone: ['playful', 'reflective'],
    keywords: ['Da Vinci', 'patterns', 'notebooks', 'search', 'mind'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
];

// Simple in-memory store for new pages (mock)
let pages: Page[] = [...mockPages];

export function getPages(): Page[] {
  return [...pages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getPage(id: string): Page | undefined {
  return pages.find(p => p.id === id);
}

export function addPage(page: Omit<Page, 'id'>): Page {
  const newPage: Page = {
    ...page,
    id: Date.now().toString(),
  };
  pages = [newPage, ...pages];
  return newPage;
}

export function deletePage(id: string): void {
  pages = pages.filter(p => p.id !== id);
}

export function loadTestPages(testPages: Page[]): void {
  pages = [...testPages, ...mockPages];
}

export function clearAllPages(): void {
  pages = [...mockPages];
}
