# Lovable briefing — /why pages

Twee pagina's. Twee ingangen. Dezelfde architecturele waarheid.

---

## Overzicht

| | anchoring.app/why | umarise.com/why |
|---|---|---|
| Publiek | Individuen, creators, freelancers | Developers, platforms, B2B partners |
| Toon | Direct, menselijk, eerlijk | Technisch, zakelijk, precies |
| Lengte | Kort — 5 secties | Langer — 8 secties |
| Auth | Geen | Geen |
| Bron | anchoring-why-b2c.md | umarise-why-b2b.md |

Beide pagina's zijn statisch. Geen auth. Geen account. Geen formulieren.
Museum aesthetic — Playfair Display + EB Garamond, donkere achtergrond, goud accent.

---

## PAGE 1 — anchoring.app/why

**Route:** `/why`
**Bronbestand:** `anchoring-why-b2c.md`

### Structuur

```
SECTIE 1 — Opening statement
SECTIE 2 — Wat er gebeurt als je anchort
SECTIE 3 — Wat je krijgt
SECTIE 4 — Waarom het gratis is
SECTIE 5 — Één ding dat wij vragen te vertrouwen
SECTIE 6 — De test die wij op elke beslissing toepassen
FOOTER  — Drop. Save. Verify. Optional.
```

### Sectie 1 — Opening

Grote kop, centered, veel witruimte:

```
We make the proof.
Then we step away.
```

Subkop, kleiner, goud:
```
What you anchor is yours. Not ours to guard, access, or revoke.
```

Geen knop hier. De tekst staat voor zichzelf.

---

### Sectie 2 — Wat er gebeurt

Headline: `What happens when you anchor`

Drie stappen, horizontaal op desktop / verticaal op mobiel.
Geen iconen — alleen nummers in goudkleur.

```
1. Your file is hashed in your browser.
   It never leaves your device.

2. The hash is sent to our API.
   We record it and anchor it to Bitcoin via OpenTimestamps.

3. You receive a ZIP.
   It contains everything needed to verify the proof —
   without us, without an account, without a server.
```

---

### Sectie 3 — Wat je krijgt

Headline: `What you get`

Eenvoudige lijst, geen bullets — gewone alineatekst:

```
A ZIP file that is yours.
Inside: your original file, a certificate, and an OTS proof.

The OTS proof is an open standard.
Anyone can verify it against Bitcoin.
No account. No Umarise server. No expiry.

If we stop existing tomorrow, your proof remains valid.
That is not a promise. That is how it is built.
```

---

### Sectie 4 — Waarom gratis

Headline: `Why it is free`

```
After we issue the proof, there is nothing left for us to manage.

No file stored. No account to maintain. No certificate to host.
The marginal cost of one more anchor approaches zero.

Free is not a strategy. It is the result of minimal dependency.
```

---

### Sectie 5 — Eerlijke grens

Headline: `One thing we ask you to trust`

```
We record the correct hash at the correct moment.
That is the one action that requires trusting us.

After that, the trust transfers to Bitcoin.

You can verify this yourself: calculate the SHA-256 hash
of your original file and compare it with the hash
in your certificate. They will match, or the proof is invalid.
```

---

### Sectie 6 — De test

Headline: `The test we apply to every decision`

```
Does this choice make you dependent on Umarise
for the validity of your proof?

If yes, we do not build it.

That constraint is not marketing.
It is a limit we place on ourselves.
```

---

### Footer van de pagina

Centered, goud, grote letter-spacing:

```
Drop. Save. Verify. Optional.
```

CTA knop onder footer:
`Anchor something →` → linkt naar `/`

---

## PAGE 2 — umarise.com/why

**Route:** `/why`
**Bronbestand:** `umarise-why-b2b.md`

### Structuur

```
SECTIE 1 — Context: het probleem
SECTIE 2 — The Provenance Gap
SECTIE 3 — The Gap in Automated Workflows
SECTIE 4 — How it works
SECTIE 5 — We make the proof. Then we step away.
SECTIE 6 — One honest boundary
SECTIE 7 — Interoperability
SECTIE 8 — What Anchor Layer Is Not
```

---

### Sectie 1 — Context

Headline: `Systems cannot prove unaltered intake`

```
Every automated system records what it produces.
Few record what they received — independently,
before processing began.

When a dispute arises, the question is not
what the system generated.
The question is what went in.

Platform logs are internal.
Internal logs are controlled by the platform.
A controlled log is a weak witness.
```

---

### Sectie 2 — The Provenance Gap

Headline: `The gap C2PA does not fill`

```
C2PA records who created something, with which device,
through which edits.

It does not record what existed at a specific moment
before the workflow touched it.

Metadata is embedded in the file.
Embedded metadata is stripped on upload,
compression, and format conversion.

An external anchor is independent of the file.
It cannot be stripped. It cannot be lost with the file.
It records one thing: these bytes existed at this moment.
```

---

### Sectie 3 — Automated Workflows

Headline: `The provenance gap in automated workflows`

```
What was the exact input before AI processing began?
What did the file contain before your pipeline transformed it?
What existed before the model saw it?

These questions matter for AI Act compliance,
for audit trails, for dispute resolution.

An anchor placed before processing creates
an independent record of the input state —
verifiable without the platform that processed it.
```

---

### Sectie 4 — How it works

Headline: `How it works`

Twee kolommen: stappen links, code rechts.

**Stappen:**
```
1. Hash the input — SHA-256, computed before processing
2. POST to /v1-core-origins with your API key
3. Receive origin_id and proof_status: pending
4. After ~20 minutes: anchored in Bitcoin via OTS
5. Download .ots proof — independently verifiable
```

**Code:**
```bash
curl -X POST https://core.umarise.com/v1-core-origins \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"hash": "sha256_hex_of_your_input"}'
```

Response:
```json
{
  "origin_id": "fb025c0e-...",
  "hash": "sha256:a1b2...",
  "proof_status": "pending",
  "captured_at": "2026-02-22T..."
}
```

---

### Sectie 5 — We step away

Headline: `We make the proof. Then we step away.`

```
The .ots file is an open standard.
Verification runs against Bitcoin, not our servers.

If Umarise ceases to exist tomorrow,
every proof issued remains independently verifiable.

That is not a promise. That is the architecture.
```

---

### Sectie 6 — One honest boundary

Headline: `One honest boundary`

```
We must be trusted at intake — for one action:
recording the correct hash at the correct moment.

We cannot silently alter a recorded hash.
The OTS proof is cryptographically bound to what was submitted.
Any alteration would cause verification against Bitcoin to fail
immediately and visibly.

This is the difference between fully trustless
and trust-minimized.

We ask trust for one moment. After that moment,
trust transfers to Bitcoin.
```

---

### Sectie 7 — Interoperability

Headline: `SHA-256 is the standard`

```
The hash is raw SHA-256 hex — no prefix required on input,
sha256: prefix returned in response.

Compatible with any system that can compute SHA-256.
No SDK required. No proprietary format.
The .ots proof format is open and verifiable
by any OTS-compatible tool.
```

---

### Sectie 8 — What this is not

Headline: `What Anchor Layer is not`

Twee kolommen — tabel:

| What it proves | What it does not prove |
|---|---|
| These exact bytes existed at this moment | Who created them |
| Hash anchored in Bitcoin via OTS | That this is the first or only attestation |
| .ots proof independently verifiable | That the content is original or unique |
| Proof survives without Umarise | Legal ownership or authorship |

Slottekst:

```
Anchor Layer is a chronological primitive.
It records existence at a moment in time.
Nothing more. That precision is intentional.
```

CTA onderaan:
`API reference →` → linkt naar `/api-reference`
`Request access →` → linkt naar `/intake`

---

## Design instructies (beide pagina's)

**Typografie:**
- Headlines: Playfair Display, weight 400, groot
- Body: EB Garamond, weight 400, 18-20px, ruime regelafstand (1.8)
- Code: JetBrains Mono of DM Mono
- Labels/accenten: letter-spacing 0.2em, uppercase, goud

**Kleur:**
- Achtergrond: #08080f (bijna zwart, koele ondertoon)
- Body tekst: #e8e3d8 (warm off-white)
- Accenten: #b8955a (goud)
- Code achtergrond: #0f0f1a
- Scheidslijnen: rgba(200,185,150,0.12)

**Layout:**
- Max-width: 720px voor tekstblokken
- Secties: minimaal 80px padding top/bottom
- Geen zijbalken, geen navigatie-ruis
- Veel witruimte — dit is documentatie, geen marketingpagina

**Wat niet mag:**
- Geen bullet-point lijsten (gebruik alinea's of genummerde stappen)
- Geen hero-image of illustratie
- Geen testimonials of social proof
- Geen pricing of upgrade-CTA
- Geen em dashes (gebruik gewone streepje of herformuleer)

---

## Wat je niet hoeft te bouwen

- Geen auth
- Geen account-check
- Geen server-side rendering vereist (statische pagina's)
- Geen formulieren (behalve de CTA knoppen die linken naar bestaande pagina's)

---

*Guardian check: C0, C1, C7, C8, C13, C15, C18 — pass. Geen overclaims. Geen em dashes. Geen auteurschapsclaims. Geen "beschermt" taal.*
