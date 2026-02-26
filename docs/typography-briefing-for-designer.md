# Typography Briefing — Design Review Request

**Doel:** Eén consistente type scale voor alle pagina's op anchoring.app, itexisted.app en umarise.com.
**Vraag aan ontwerper:** Geef per element-type de gewenste font-size aan voor mobile (375px) en desktop (1440px). Gebruik onderstaande inventaris als startpunt.

---

## Referentie: umarise.com (Landing) — *huidige waarden zijn goed*

| Element | Font | Huidig mobile | Huidig desktop | Opmerkingen |
|---------|------|---------------|----------------|-------------|
| Hero title | Serif (system) | 48px (`text-5xl`) | 72px (`text-7xl`) | Leading 1.15 |
| Subtitle body | System | 16px (`text-base`) | 16px | Tracking-wide |
| Category label | System | 14px (`text-sm`) | 14px | Uppercase, tracking-widest |
| Nav links | System | 16px | 16px | — |
| Footer | Mono | 11px | 11px | Uppercase, tracking-widest |

---

## itexisted.app — Capture pagina

| Element | Font | Huidig | Gewenst? | Opmerkingen |
|---------|------|--------|----------|-------------|
| Branding copy ("It existed." etc.) | Playfair | 20px | ___ | 4 regels, leading 2.2 |
| Plus-icoon in cirkel | Playfair | 42px | ___ | — |
| Micro-branding ("itexisted.app") | Mono | 7px | ___ | Tracking 3px, uppercase |
| Signing status labels | Mono | 9px | ___ | Tracking 2px |
| Biometric prompt title | Playfair | 18px | ___ | — |
| Biometric prompt subtitle | Garamond italic | 13px | ___ | — |
| File name | Garamond italic | 11px | ___ | — |

## itexisted.app — Submitted (Anchored) pagina

| Element | Font | Huidig | Gewenst? | Opmerkingen |
|---------|------|--------|----------|-------------|
| Title ("Submitted.") | Garamond | 48px | ___ | — |
| Rename tip | Garamond italic | 20px | ___ | — |
| Short token in tip | Mono | 17px | ___ | — |
| Row labels ("Origin ID", "Date") | Mono | 13px | ___ | Uppercase, tracking 2px |
| Origin ID value | Mono | 22px | ___ | Tracking 4px |
| Date/time value | Garamond | 20px | ___ | — |
| Hash value | Mono | 13px | ___ | Break-all, tracking 0.3px |
| Section header ("✓ Completed") | Mono | 12px | ___ | Uppercase, tracking 3px |
| Completed items | Garamond | 20px | ___ | Leading 1.5 |
| Checkmarks | Mono | 16px | ___ | — |
| Verify collapsible label | Garamond italic | 18px | ___ | — |
| Verify file drop label | Mono | 11px | ___ | Uppercase |
| Pending countdown | Mono | 14px | ___ | Tracking 4px, animated |
| Pending section header | Mono | 12px | ___ | Uppercase |
| Pending explanation | Garamond | 20px | ___ | Leading 1.5 |
| Proof URL | Mono | 14px | ___ | Tracking 3px |
| "Anchor another file" button | Mono | 11px | ___ | Tracking 4px |

## itexisted.app — Proof pagina

| Element | Font | Huidig | Gewenst? | Opmerkingen |
|---------|------|--------|----------|-------------|
| Title ("Your proof is ready.") | Garamond | 48px | ___ | — |
| Short token | Mono | 26px | ___ | Tracking 6px |
| Date & time | Garamond | 24px | ___ | — |
| Device-signed label | Mono | 11px | ___ | Tracking 2px |
| Step numbers ("1.", "2.") | Mono | 17px | ___ | Tracking 3px |
| Step labels (uppercase) | Mono | 17px | ___ | Tracking 4px |
| "(optional)" label | Mono | 12px | ___ | Lowercase |
| Drop zone label | Mono | 11px | ___ | Uppercase, tracking 2px |
| Drop zone description | Garamond italic | 14px | ___ | — |
| File match indicator | Mono | 11px-12px | ___ | — |
| Pending countdown | Mono | 14px | ___ | Tracking 4px |
| Action buttons (Share/Download) | Mono | 17px | ___ | Tracking 4px |

---

## anchoring.app — Gallery Detail Modal (MarkDetailModal)

| Element | Font | Huidig | Gewenst? | Opmerkingen |
|---------|------|--------|----------|-------------|
| Short token | Mono | 21px | ___ | Tracking 5px |
| Date & time | Garamond | 18px | ___ | — |
| Hash | Mono | 12px | ___ | Tracking 1px, break-all |
| Badge labels (HASH, CERTIFICATE) | Mono | 11px | ___ | Tracking 2px |
| Step numbers ("1.", "2." etc.) | Mono | 14px | ___ | Tracking 3px |
| Step labels (uppercase) | Mono | 14px | ___ | Tracking 3px |
| File match info | Mono | 11px | ___ | — |
| Verification log items | Mono | 14px | ___ | — |
| Verification status symbols (✓/✗) | Mono | 12px | ___ | — |
| Verification detail text | Mono | 11px | ___ | Break-all |
| "Verified" label (green) | Mono | 14px | ___ | Tracking 2px |
| Share button | Mono | 14px | ___ | Tracking 3px |
| Attestation description | Garamond | 18px | ___ | Leading 1.6 |
| Attestation price ("€4,95") | — | — | ___ | In description |
| "Request attestation →" button | Mono | 14px | ___ | Tracking 3px |
| "device signed" label | Mono | 21px | ___ | Tracking 1px |

---

## anchoring.app — Capture / Seal flow

| Element | Font | Huidig | Gewenst? | Opmerkingen |
|---------|------|--------|----------|-------------|
| Capture prompt | Varies | Varies | ___ | Refereer aan CaptureScreen |
| Sealed confirmation | Varies | Varies | ___ | Refereer aan SealedScreen |

---

## Design principes (ter referentie)

- **Fonts:** Playfair Display (titels), EB Garamond (body/italic), DM Mono (labels/data)
- **Kleuren:** Cream #F0EAD6, Gold #C9A96E, Dark green #0A0F0A / #0F1A0F
- **Contrast:** WCAG AA minimum
- **Approach:** Museum aesthetic — rustig, ruimtelijk, eerder te groot dan te klein

## Gevraagde output

1. Vul de "Gewenst?" kolommen in
2. Geef aan of mobile en desktop dezelfde maat moeten zijn of schalen
3. Flag elementen die je te klein of te groot vindt
4. Optioneel: stel een type scale voor (bijv. 12 / 14 / 17 / 20 / 24 / 32 / 48)
