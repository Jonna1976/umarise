# Lovable Briefing — Laag 3 Attestatie UI
23 februari 2026.

---

## Context

Laag 1 en 2 zijn gebouwd. Anchor en passkey werken.

Laag 3 is de optionele attestatielaag. Een gecertificeerde derde bevestigt met één klik dat deze mens op dit moment deze anchor heeft gezet. De gebruiker vraagt dit aan vanuit de gallery. anchoring.app regelt de rest binnen 24 uur.

Dit is geen nieuw scherm. Dit zijn drie toevoegingen aan bestaande schermen.

---

## Toevoeging 1 — Gallery detail-view: knop

**Waar:** Gallery detail-view — naast `Verify this proof` en `Share`

**Wanneer zichtbaar:** Alleen nadat Bitcoin-bevestiging binnen is. Niet bij pending anchors.

**Wat:**

`Request attestation`

**Stijl:**
- DM Mono 9px, letter-spacing 3px, uppercase, `--cream-dim`
- Zelfde stijl als Verify en Share
- Volgorde: `Verify this proof` · `Share` · `Request attestation`

---

## Toevoeging 2 — Attestatie aanvraagscherm

Na tik op `Request attestation` opent een modal of nieuw scherm.

**Inhoud:**

Titel (DM Mono 9px uppercase gold):
`ATTESTATION`

Body (EB Garamond 15px cream-soft):
A certified third party will confirm that you — the holder of this passkey — set this anchor at this moment.

You will receive an updated ZIP within 24 hours containing your anchor and the attestation certificate.

Prijsblok (DM Mono, cream-soft):
`€ 4,95`
`One-time. No subscription. No surprises.`

Bevestigingsknop:
`Confirm attestation →`
DM Mono, letter-spacing 4px, uppercase, `--gold`

Annuleerlink (klein, cream-dim):
`Cancel`

---

## Toevoeging 3 — Gallery detail-view: attestatie-status

Na bevestiging toont de gallery detail-view een statusregel onder de bestaande info.

**Pending:**
`Attestation requested — within 24 hours`
EB Garamond italic, 12px, cream-dim

**Voltooid:**
`Attested ✓`
EB Garamond italic, 12px, gold-dim

Bij tik op `Attested ✓` opent een kleine modal:
Naam attestant, datum attestatie, download link voor uitgebreide ZIP.

---

## Wat niet verandert

Het beginscherm. De sealed pagina. De onboarding. De gallery-lijst.

Alles blijft zoals het is. Laag 3 is een optionele laag — onzichtbaar voor wie het niet nodig heeft.

---

*Lovable UI briefing Laag 3 — 23 februari 2026.*
*Backend API: zie technische briefing Laag 3.*
