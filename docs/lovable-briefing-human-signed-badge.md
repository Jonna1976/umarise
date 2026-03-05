# Lovable Briefing — Human Signed badge in itexisted.app

**Datum:** 5 maart 2026
**Prioriteit:** UI enhancement — bestaande gallery en proof pagina's

---

## Wat we bouwen

Een klein vingerafdruk-icoontje dat verschijnt bij elke anchor die met een passkey is ondertekend. Het icoontje is het enige visuele signaal. Geen tekst. Geen uitleg. Mensen vragen wat het betekent.

---

## Het icoontje

Gebruik deze inline SVG (Lucide fingerprint, geen library nodig):

```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
  <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
  <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
  <path d="M2 12a10 10 0 0 1 18-6"/>
  <path d="M2 16h.01"/>
  <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
  <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
  <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
  <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
</svg>
```

---

## De badge

```css
.badge-human-signed {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #0F1A0F;
  border: 1px solid rgba(201, 169, 110, 0.35);
  border-radius: 3px;
}
```

Kleuren:
- Icoontje aanwezig (passkey): stroke `#C9A96E`
- Icoontje afwezig (geen passkey): stroke `#F0EAD6`, opacity `0.15`, border `rgba(240,234,214,0.07)`

---

## Waar het verschijnt

### 1. Gallery — rij per anchor
Rechts uitlijnen naast datum/tijd. Altijd zichtbaar, ook als er geen passkey is (dan gedimd).

```
[ bestandsnaam ]     [ datum ]     [ 🔏 ]
[ bestandsnaam ]     [ datum ]     [ · ]   ← geen passkey, gedimd
```

### 2. Submitted / Anchored pagina
Onder de Origin ID en datum, als onderdeel van de bewijsregel:

```
ORIGIN ID     abc-123-def
DATE          5 mrt 2026, 14:03
              [ 🔏 ]   ← badge, rechts naast datum of onder datum
```

### 3. Proof pagina
Naast of onder de short token, als onderdeel van de proof-header:

```
abc · 4f2
5 mrt 2026   [ 🔏 ]
```

---

## Gedrag

- Badge is **altijd zichtbaar** in de gallery, ook zonder passkey (gedimd = signaal op zich)
- Bij hover: tooltip tekst `"Human signed — anchored with device passkey"`
- Badge is **niet klikbaar**, alleen informatief
- Op de proof pagina en submitted pagina: badge alleen tonen als passkey aanwezig is

---

## Logica

```javascript
// anchor object heeft een veld device_signed: boolean
// true  → badge goud, border goud
// false → badge gedimd, border nauwelijks zichtbaar

const HumanSignedBadge = ({ deviceSigned }) => (
  <div className={`badge-human-signed ${deviceSigned ? 'signed' : 'unsigned'}`}>
    <FingerprintSVG color={deviceSigned ? '#C9A96E' : '#F0EAD6'} opacity={deviceSigned ? 0.85 : 0.15} />
  </div>
)
```

---

## Wat het niet is

- Geen tekst. Geen "Human Signed" label in de badge zelf.
- Geen grote prominente UI. Klein, subtiel, consequent aanwezig.
- Geen eigen pagina of uitleg in de UI. Mensen die willen weten wat het is, vragen het of klikken op info.

---

## Referentie

Het gerenderde voorbeeld staat in `fingerprint-lucide.html` — zie de "In context" sectie onderaan voor exact hoe het eruitziet in een gallery row.

---

*itexisted.app — Lovable briefing — 5 maart 2026*
