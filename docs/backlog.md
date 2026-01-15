# Umarise Product Backlog

> Last updated: 2026-01-15

---

## 🎯 Core Scope Definition

**Mission**: Protect the beginning of your thought.

**What you can capture** (anything you can photograph):
- Handwritten text & notes
- Sketches & drawings
- Moodboards & collages
- Napkin ideas / beer coaster scribbles
- Whiteboard sessions
- Index cards
- Mind maps
- Any visual artifact marking where an idea began

**The Wedge** (non-negotiable flow):
```
Photo → 2 words → Find in 60 seconds
```

---

## ✅ Must-Have (Pilot v1)

| Feature | Status | Notes |
|---------|--------|-------|
| Single photo capture | ✅ Done | Camera + file upload |
| 2-word cue input | ✅ Done | User-defined retrieval words |
| OCR + AI analysis | ✅ Done | Extracts text, keywords, summary |
| Simple search | ✅ Done | Full-text across all fields |
| Timeline view | ✅ Done | Chronological history |
| Origin hash (SHA-256) | ✅ Done | Cryptographic proof of origin |
| Export (ZIP + manifest) | ✅ Done | Forensic audit package |

---

## 🔜 Nice-to-Have (v1.x)

| Feature | Priority | Notes |
|---------|----------|-------|
| Capsules (multi-page documents) | Medium | Already built, needs simplification |
| Related pages suggestions | Low | AI-powered connections |
| Share memory card | Low | Social sharing |

---

## 🚫 Out of Scope (Deferred)

| Feature | Reason | Revisit |
|---------|--------|---------|
| **Audio capture/upload** | Different use case, requires transcription pipeline | v2+ |
| Patterns view | Distraction from Wedge | Post-pilot |
| Personality analysis | Distraction from Wedge | Post-pilot |
| Threads view | Distraction from Wedge | Post-pilot |
| Kompas view | Distraction from Wedge | Post-pilot |
| Year reflection | Distraction from Wedge | Post-pilot |
| Memory orbit | Distraction from Wedge | Post-pilot |
| Compare profiles | Distraction from Wedge | Post-pilot |

---

## 🐛 Technical Debt / Cleanup

| Item | Priority | Notes |
|------|----------|-------|
| Remove Brief-modus from CameraView | High | Simplify to single capture |
| Unify all copy to English | High | Remove Dutch remnants |
| Hide non-Wedge features in pilot | High | Patterns, Personality, etc. |
| Simplify "Codex" naming | Medium | Rename to "Timeline" or "Memory" |

---

## 📝 Copy & UX Issues

| Location | Issue | Fix |
|----------|-------|-----|
| ProcessingView | Mixed terminology | Audit for consistency |
| HistoryView | Naming unclear | Review |
| OnboardingScreen | May need simplification | Review |

---

## 🔮 Future Considerations (v2+)

- Audio capture with Whisper transcription
- MCP Server integration (Origin Authority)
- Blockchain timestamp anchoring
- Team/enterprise features
- Hetzner self-hosted deployment

---

*This backlog is the single source of truth for product scope.*
