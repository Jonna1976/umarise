# Umarise — PWA Action Specification (Binding)

**Status:** CANONICAL  
**Version:** 1.0  
**Classification:** Technical Implementation Constraint

---

## Strategic Intent

> Umarise should feel like signing something you were already holding — not like opening a place where something begins.

The PWA is a **temporary bridge** to the iOS Share Sheet experience. It must be designed to be replaceable, not permanent.

---

## Core Principle

**The PWA is an action, not a destination.**

| Correct Feeling | Incorrect Feeling |
|-----------------|-------------------|
| A stamp | An app |
| A seal | A place |
| A breath | A journey |
| Done | Started |

---

## Manifest Configuration (Binding)

```json
{
  "name": "Umarise",
  "short_name": "Umarise",
  "description": "Mark beginnings.",
  "start_url": "/app",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "orientation": "portrait",
  "share_target": {
    "action": "/app",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "media",
          "accept": ["image/*"]
        }
      ]
    }
  }
}
```

### Manifest Rules

| Property | Value | Rationale |
|----------|-------|-----------|
| `description` | "Mark beginnings." | No explanation, only action |
| `start_url` | `/app` | Bypass landing page noise |
| `display` | `standalone` | Feel native, not browser |
| `background_color` | `#0a0a0a` | Dark, ritual aesthetic |
| `theme_color` | `#0a0a0a` | Unified, no branding prominence |
| `categories` | `["productivity", "utilities"]` | Utility, not lifestyle |

---

## Web Share Target API

### Purpose

Enable the discovery pattern:

```
📷 Photo / Gallery / Files
    ↓
⬆️ Tap Share
    ↓
✨ Umarise appears as option
    ↓
🔒 Marked.
    ↓
🫥 Returns to previous context
```

### Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| Android (Chrome) | ✅ Full | PWA must be installed to home screen |
| iOS (Safari) | ❌ None | Web Share Target not supported |
| Desktop (Chrome) | ⚠️ Partial | Requires installed PWA |

### Android Discovery Flow

1. User opens `umarise.lovable.app` in Chrome
2. User taps menu → "Add to Home Screen"
3. PWA installs with Share Target capability
4. User opens Photos → selects image → Share
5. **Umarise appears in native Share Sheet**
6. Tap Umarise → instant mark → return

---

## Phase 0: Capture Portal

### Binding Constraints

| Rule | Implementation |
|------|----------------|
| No text | Zero instructional copy |
| No explanation | No "how to" or "why" |
| No onboarding | No introduction screens |
| No navigation | No visible menu/tabs |
| One gesture | Camera icon only |

### Visual Specification

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│              ◉                      │  ← Glowing capture portal
│         (camera icon)               │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### Why Empty?

> The user already knows what "take a photo" means.  
> Umarise borrows this muscle memory.  
> No learning required.

---

## Ritual Flow Phases

### Phase 0 — CAPTURE
- Duration: Until user acts
- UI: Camera portal only
- Copy: None
- Feeling: Instinctive

### Phase 1 — PAUSE
- Duration: 1.8 seconds
- UI: Dark overlay
- Copy: "This is where it began."
- Feeling: Recognition

### Phase 2 — MARK
- Duration: 2.8 seconds
- UI: Certificate of Beginning
- Elements:
  - Gold "U" seal
  - Beginning sequence number
  - Timestamp
  - Cryptographic fingerprint
- Feeling: Gravity

### Phase 3 — RELEASE
- Duration: 0.8 seconds
- UI: Fade to black
- Action: Auto-return to camera
- Feeling: Completion

---

## What the PWA Must Never Contain

| Forbidden Element | Reason |
|-------------------|--------|
| Onboarding | Discovery is external |
| Tutorial | The gesture is known |
| "What is Umarise" | The app doesn't explain itself |
| History/Archive | The app is not a destination |
| Search | There is nothing to find |
| Settings | There is nothing to configure |
| Navigation menu | There is nowhere to go |
| "Done" button | Completion is automatic |
| Return prompt | The ritual ends itself |

---

## PWA Installation Behavior

### Install Prompt Strategy

**Do not prompt installation aggressively.**

The PWA should be discovered through:
1. Natural browser prompts
2. One-time subtle suggestion (if any)
3. External communication ("Install for Share Sheet access")

### Post-Installation

After installation, the PWA must:
- Open directly to `/app` (capture portal)
- Skip any splash screens
- Skip any introduction
- Be immediately ready for the marking gesture

---

## Offline Behavior

### Constraint

The PWA must work offline for the capture phase:
- Camera access: Works offline
- Image processing: Works offline
- Hash computation: Works offline

### Sync-When-Online

- Queue attestation requests when offline
- Sync automatically when connection returns
- Never block the ritual for network

---

## iOS Limitations & Future State

### Current (PWA)

iOS Safari does not support Web Share Target.  
Users must open the app directly.

This is acceptable because:
- The PWA is explicitly a bridge
- The experience is designed to be replaceable

### Future (Native iOS)

The target experience:

```
📷 iOS Camera / Photos / Files
    ↓
⬆️ Tap Share
    ↓
┌─────────────────────────────┐
│  Mark as Beginning          │  ← Primary action label
│  Umarise                    │  ← Attribution (subtle)
└─────────────────────────────┘
    ↓
✨ Brief haptic + "Marked." overlay (≤2s)
    ↓
🫥 Returns to previous context
```

The PWA must be designed so this transition feels like an **upgrade**, not a **replacement**.

---

## Validation Test

### The One Question

> "Did the user feel they went somewhere?"

- If yes → PWA has failed
- If no → PWA is correct

### Success Criteria

After using the PWA, the user should feel:
- ✅ "That's done."
- ✅ "I don't need to go back."
- ✅ "It exists now."

The user should NOT feel:
- ❌ "I should check on this later."
- ❌ "What else can I do here?"
- ❌ "Where did it save?"

---

## Technical Implementation Notes

### Service Worker

- Cache static assets for offline use
- Do not cache user data
- Minimal footprint

### Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 2.0s |
| Bundle size | < 500KB |

### Haptic Feedback

Use `@capacitor/haptics` for:
- Capture confirmation: `ImpactStyle.Medium`
- Mark completion: `NotificationType.Success`

---

## Document History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-02-03 | Initial canonical specification |

---

*Classification: Binding specification*  
*Status: CANONICAL*
