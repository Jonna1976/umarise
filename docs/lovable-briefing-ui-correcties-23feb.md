# Lovable Briefing — UI Correcties
## Vier aanpassingen, prioriteit hoog

23 februari 2026.

---

## Correctie 1 — Gallery: permanentie-zin toevoegen

**Waar:** Origin Registry (S3 — de gallery/wall)

**Wat:** Voeg één vaste zin toe onderaan de gallery, subtiel, altijd zichtbaar.

**Tekst:**
> The proof exists forever. Independent of this service.

**Stijl:**
- EB Garamond italic, 12px
- `--cream-dim` (rgba 245,240,232, 0.4)
- Gecentreerd, onderaan de gallery boven de bottom safe area
- Geen animatie, geen interactie

**Waarom hier en niet op de sealed pagina:**
Op de sealed pagina is de gebruiker midden in de handeling. De betekenis landt pas in de gallery — waar je terugkijkt op wat je hebt gebouwd. Dat is het moment waarop deze zin resoneert.

---

## Correctie 2 — Verify: van beginscherm naar gallery detail-view

**Huidig gedrag:** Verify-knop staat prominent op het beginscherm naast de capture cirkel.

**Probleem:** Dit is anchoring.app, geen verifying.app. De primaire handeling is anchoren. Verify als prominente knop op het beginscherm suggereert dat dit een tweerichtingsapp is — dat is het niet.

**Aanpassing:**
- Verwijder de Verify-knop van het beginscherm volledig
- Verify wordt toegankelijk vanuit de gallery detail-view (zie correctie 4)

**Waarom:**
De uitleg over verify gebeurt vóór de app — in de onboarding en de /why pagina. In de app zelf staat één handeling centraal: anchoren.

---

## Correctie 3 — Why this exists: uit de app-flow

**Huidig gedrag:** "Why this exists →" link op de sealed pagina opent een apart tabblad. Gebruiker verliest de flow.

**Aanpassing:**
- Verwijder "Why this exists →" van de sealed pagina volledig
- Why-content verplaatsen naar de onboarding (zie: onboarding-inhoud-23feb.md)
- De onboarding wordt eenmalig getoond bij eerste gebruik, sluitbaar, niet herhaalbaar tenzij gebruiker het opvraagt

**Waarom:**
De /why pagina die nu gelinkt wordt is de B2B versie — te complex en te lang voor een B2C gebruiker die net zijn eerste anchor heeft gezet. De uitleg moet vóór de handeling komen, niet erna.

---

## Correctie 4 — Gallery detail-view: verify en share als complete actie

**Wat:** Wanneer een gebruiker een anchor in de gallery aantipt, opent een detail-view van dat anchor. Voeg hier twee acties toe:

**1. Verify this proof**
- Verifieert het bewijs client-side tegen Bitcoin
- Toont resultaat inline in de detail-view — geen apart tabblad, geen app-verlies
- Stijl: tekstlink, DM Mono 9px, letter-spacing 3px, `--cream-dim`

**2. Share this proof**
- Opent native share sheet (iOS/Android) met de ZIP als bijlage
- Of: kopieert verify-link naar klembord
- Stijl: tekstlink naast verify, zelfde opmaak

**Volgorde in de detail-view:**
Origin ID → Timestamp → Hash → `Verify this proof` · `Share`

**Waarom verify en share samen:**
Dit is de complete actie na het anchoren: je kijkt terug op een bewijs, verifieert dat het klopt, en deelt het met wie het nodig heeft. Eén plek, twee handelingen, geen app-verlies.

---

## Samenvatting

| Element | Huidig | Nieuw |
|---|---|---|
| Gallery | Geen permanentie-boodschap | "The proof exists forever. Independent of this service." |
| Verify knop beginscherm | Prominent naast capture cirkel | Verwijderd |
| Why this exists (sealed) | Link naar apart tabblad | Verwijderd — naar onboarding |
| Gallery detail-view | Alleen anchor-info | Verify + Share als complete actie |

---

*Briefing 23 februari 2026. Zie ook: onboarding-inhoud-23feb.md en b2c-why-herzien-23feb.md*
