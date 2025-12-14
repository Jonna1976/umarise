# Umarise Style Manual

Dit document beschrijft het visuele ontwerpsysteem voor Umarise, geïnspireerd door de Rising app. Het doel is een rustige, natuurlijke en tijdloze uitstraling die past bij handgeschreven notities en persoonlijke reflectie.

---

## Ontwerpfilosofie

- **Natuurlijk**: Alleen kleuren uit de natuur - geen felle of synthetische tinten
- **Rustgevend**: Warme, gedempte tonen die uitnodigen tot reflectie
- **Tijdloos**: Klassieke typografie gecombineerd met moderne eenvoud
- **Leesbaar**: Hoog contrast tussen tekst en achtergrond

---

## Kleurenpalet

### Primaire Kleuren

| Naam | HSL Waarde | Gebruik |
|------|------------|---------|
| **Forest Deep** | `hsl(165, 30%, 8%)` | Donkere achtergronden (capture scherm) |
| **Forest** | `hsl(160, 25%, 12%)` | Donkere accenten |
| **Teal** | `hsl(165, 25%, 18%)` | Secundaire donkere tint |
| **Cream** | `hsl(42, 35%, 94%)` | Lichte achtergronden (content schermen) |
| **Paper** | `hsl(42, 45%, 94%)` | Kaart achtergronden |
| **Gold/Oker** | `hsl(38, 45%, 45%)` | Primaire accent kleur |
| **Gold Muted** | `hsl(38, 30%, 50%)` | Gedempte accent |

### Achtergronden

```css
/* Donker scherm (capture/portal) */
--codex-ink-deep: 165 30% 8%;    /* Diep donkergroen */
--codex-ink: 160 25% 12%;        /* Donkergroen */
--codex-forest: 160 20% 12%;     /* Forest groen */
--codex-teal: 165 25% 18%;       /* Teal accent */

/* Licht scherm (content) */
--background: 42 35% 94%;        /* Warm beige/cream */
--card: 42 40% 97%;              /* Lichtere cream voor cards */
--codex-cream: 42 35% 95%;       /* Cream wit */
--codex-paper: 42 45% 94%;       /* Papier tint */
```

### Tekst Kleuren

```css
/* Op donkere achtergrond */
--foreground (dark): hsl(42, 35%, 92%)   /* Cream wit */

/* Op lichte achtergrond */
--foreground (light): hsl(160, 25%, 12%) /* Donker forest */

/* Accenten */
--primary: hsl(38, 45%, 40%)             /* Goud/oker */
--muted-foreground: hsl(160, 15%, 40%)   /* Gedempte tekst */
```

### Gradient voor Donkere Schermen

```css
bg-gradient-to-b from-codex-ink-deep via-codex-ink to-codex-forest
```

Dit creëert een subtiele verticale gradient van diep donkergroen naar forest groen.

---

## Typografie

### Lettertypes

| Type | Font Family | Gebruik |
|------|-------------|---------|
| **Display/Titels** | Playfair Display | h1, h2, h3, h4, belangrijke titels |
| **Body** | Inter | Alle andere tekst, UI elementen |

### Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
```

### Tailwind Classes

```jsx
// Titels (serif)
<h1 className="font-serif">Titel</h1>

// Body tekst (sans-serif, standaard)
<p className="font-sans">Body tekst</p>
```

### Teksthiërarchie

| Element | Stijl |
|---------|-------|
| **H1** | `font-serif text-2xl font-semibold` |
| **H2** | `font-serif text-xl font-medium` |
| **H3** | `font-serif text-lg font-medium` |
| **Labels** | `text-xs uppercase tracking-wide text-primary` |
| **Body** | `text-sm text-foreground` |
| **Caption** | `text-xs text-muted-foreground` |

---

## Kleurgebruik per Context

### Donkere Schermen (Capture Portal)

```jsx
// Container
<div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-ink to-codex-forest">

// Tekst op donker
<span className="text-codex-cream">Witte tekst</span>
<span className="text-codex-gold">Gouden accent</span>
<span className="text-codex-cream/50">Gedempte tekst</span>

// Borders/accenten
<div className="border-codex-gold/20">
```

### Lichte Schermen (Content Views)

```jsx
// Container
<div className="min-h-screen bg-background">

// Header
<div className="bg-background/80 backdrop-blur-md border-b border-border">

// Tekst op licht
<span className="text-foreground">Donkere tekst</span>
<span className="text-primary">Gouden accent</span>
<span className="text-muted-foreground">Gedempte tekst</span>
```

---

## Tone Kleuren (Boeken/Cards)

Alle tones gebruiken uitsluitend natuurlijke kleuren uit het teal-forest-cream-gold spectrum:

### Donkere Tones (op lichte achtergrond)

| Tone | Achtergrond | Tekst |
|------|-------------|-------|
| **Focused** | Forest gradient | Cream wit |
| **Curious** | Teal gradient | Cream wit |
| **Calm** | Forest-teal gradient | Cream wit |
| **Frustrated** | Donker teal | Cream wit |
| **Overwhelmed** | Grijs-teal | Cream wit |

### Lichte Tones (op lichte achtergrond)

| Tone | Achtergrond | Tekst |
|------|-------------|-------|
| **Hopeful** | Gold/cream gradient | Forest donker |
| **Playful** | Warm cream gradient | Forest donker |
| **Reflective** | Cream/paper gradient | Forest donker |

### HSL Waarden voor Tones

```javascript
// Donkere tones
focused:     from-[hsl(165,25%,18%)] to-[hsl(165,30%,10%)]
curious:     from-[hsl(165,22%,22%)] to-[hsl(165,18%,14%)]
calm:        from-[hsl(160,18%,28%)] to-[hsl(160,12%,20%)]
frustrated:  from-[hsl(160,20%,20%)] to-[hsl(160,15%,12%)]
overwhelmed: from-[hsl(160,12%,26%)] to-[hsl(160,8%,18%)]

// Lichte tones
hopeful:     from-[hsl(42,45%,94%)] to-[hsl(38,35%,88%)]
playful:     from-[hsl(42,40%,94%)] to-[hsl(38,30%,86%)]
reflective:  from-[hsl(42,40%,96%)] to-[hsl(38,30%,90%)]
```

---

## UI Componenten

### Buttons

```jsx
// Primair (goud)
<Button variant="default">Actie</Button>
// Gebruikt: bg-primary text-primary-foreground

// Secundair
<Button variant="secondary">Secundair</Button>
// Gebruikt: bg-secondary text-secondary-foreground

// Ghost (transparant)
<Button variant="ghost">Ghost</Button>
```

### Cards

```jsx
<div className="bg-card border border-border rounded-xl shadow-sm">
  <div className="p-4">
    <h3 className="font-serif text-lg">Titel</h3>
    <p className="text-muted-foreground text-sm">Beschrijving</p>
  </div>
</div>
```

### Headers (Sticky)

```jsx
<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
  <div className="px-4 py-3 flex items-center gap-3">
    {/* content */}
  </div>
</div>
```

---

## Verboden Kleuren

De volgende kleuren mogen **NIET** gebruikt worden:

- ❌ Rood / Rose / Crimson
- ❌ Oranje (behalve zeer gedempte oker tinten)
- ❌ Fel geel
- ❌ Blauw / Cyan / Sky
- ❌ Paars / Violet / Fuchsia
- ❌ Roze / Pink
- ❌ Fel groen (emerald, lime)

---

## Animaties

### Standaard Transities

```css
transition-colors duration-200    /* Kleur veranderingen */
transition-all duration-300       /* Meerdere eigenschappen */
```

### Framer Motion Defaults

```jsx
// Fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}

// Slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Spring bounce
transition={{ type: 'spring', stiffness: 100, damping: 15 }}
```

### Glow Effecten (Portal)

Gebruik alleen goudtinten voor glow effecten:

```jsx
boxShadow: '0 0 40px 20px rgba(180, 140, 60, 0.3)'
```

---

## Ruimte & Layout

### Spacing

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `p-2` | 8px | Kleine padding |
| `p-4` | 16px | Standaard padding |
| `p-6` | 24px | Ruime padding |
| `p-8` | 32px | Grote secties |
| `gap-2` | 8px | Kleine gaps |
| `gap-4` | 16px | Standaard gaps |

### Border Radius

```css
--radius: 0.75rem;  /* 12px - standaard */

rounded-sm   /* 6px */
rounded      /* 12px */
rounded-lg   /* 16px */
rounded-xl   /* 20px */
rounded-2xl  /* 24px */
rounded-full /* Cirkel */
```

---

## Voorbeeld: Rising-stijl Card

```jsx
<div className="bg-background min-h-screen">
  {/* Card met cream achtergrond */}
  <div className="mx-auto max-w-sm bg-card rounded-3xl shadow-xl overflow-hidden">
    
    {/* Header met naam */}
    <div className="pt-8 pb-4 text-center">
      <h1 className="font-serif text-3xl italic text-foreground">/Uma</h1>
      <p className="text-xs uppercase tracking-widest text-primary mt-2">
        30 days of rising
      </p>
    </div>
    
    {/* Sectie label */}
    <div className="px-6 py-2">
      <p className="text-xs uppercase tracking-widest text-primary text-center">
        Your Direction
      </p>
      <p className="font-serif text-xl text-foreground text-center mt-2 italic">
        "Move toward a life where music comes first"
      </p>
    </div>
    
    {/* Keywords in goud */}
    <div className="px-6 py-4 text-center">
      <span className="font-serif italic text-primary">
        want · music · trust
      </span>
    </div>
    
  </div>
</div>
```

---

## Checklist bij Nieuwe Componenten

- [ ] Alleen natuurlijke kleuren gebruikt (teal, forest, cream, gold)
- [ ] Titels in `font-serif` (Playfair Display)
- [ ] Labels in `uppercase tracking-wide text-primary`
- [ ] Voldoende contrast tussen tekst en achtergrond
- [ ] Geen felle of synthetische kleuren
- [ ] Consistente spacing en border-radius
- [ ] Animaties met gedempte, natuurlijke bewegingen

---

*Laatst bijgewerkt: December 2024*
