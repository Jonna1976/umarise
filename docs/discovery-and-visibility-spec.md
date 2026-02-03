# Umarise — Discovery & Visibility Specification (Binding)

**Status:** CANONICAL  
**Version:** 1.0  
**Classification:** Strategic UX Constraint

---

## Core Insight (Non-Negotiable)

> Umarise is not learned in the app.  
> Umarise is recognized in context.

The app is not the communication medium.  
The action is.

Exactly like:
- QR → camera
- Shazam → listen
- AirDrop → share
- Notes → share

---

## Binding Rules

### Rule 1 — Discovery is External

**If the app explains itself, it has failed.**

The app must never contain:
- Onboarding
- Explanation
- "What is Umarise"
- "Why this matters"
- Instructions

If someone opens the app and doesn't know what it is:  
That's okay. They're too early.

---

### Rule 2 — Capture is Empty

No copy. No framing. Only a known human gesture.

Phase 0 contains:
- One camera icon
- Large, central
- Feels like iOS Camera
- No text beside it
- No instruction

---

### Rule 3 — Meaning Appears Only After the Act

Language is allowed only in **PAUSE** and **MARK**, never before.

- PAUSE: "This is where it began."
- MARK: Certificate with timestamp + fingerprint
- CAPTURE: Silent

---

### Rule 4 — The App is Not a Destination

It must feel like a stamp, not a place.

The experience must immediately convey:
- "This is complete."
- "I don't need to hold onto this."
- "This exists."

Never:
- "I need to find this later"
- "What can I do with this"
- "Where is it stored"

---

### Rule 5 — PWA is a Bridge, Not the Truth

Design it to be replaceable by the Share Sheet.

Current PWA state:
- Temporary substitute for iOS Share Sheet
- Opens directly to capture
- No extra UI, no branding, no framing
- Camera = known action

Native iOS (future):
- App is not opened
- Umarise appears as Share action
- Feels like a stamp, seal, completion

---

## External Discovery (Out of App Scope)

### One Sentence (External)

Website / App Store / demo copy:

> "When something begins — mark it."

Below (always the same):

```
Share → Umarise → Sealed.
```

Nothing more is permitted.

### One Visual Moment

The hero screenshot teaches the behavior without explanation:

```
📷 Photo
⬆️ Share
✨ Umarise
🔒 Sealed
```

This screenshot is more important than all UI combined.

---

## The One Sentence to Remember

> **Umarise is learned the same way people learn AirDrop:  
> not by explanation, but by seeing it once.**

---

## Validation Test

Ask only one question:

> "Does the app explain itself?"

- If yes → it has failed
- If no → it is correct

---

*Document version: 1.0*  
*Classification: Binding specification*  
*Status: CANONICAL*
