# Pilot Target List

> **Doel:** 5 specifieke kandidaten met naam, niet profielen  
> **Status:** Strategische targets geïdentificeerd — maart 2026

---

## Target Kandidaten

| # | Naam / Organisatie | Type | Trigger-moment | Connectie | Status |
|---|---|---|---|---|---|
| 1 | Paul | CTO (MKB) | Privacy-by-design discussie | Direct (warm) | ⏳ Ready |
| 2 | GPT-NL | Overheids-AI initiatief | AI Act compliance, publieke verantwoording | Koud / via netwerk | ⏳ Ready |
| 3 | Mistral AI | EU AI-bedrijf (open-source) | Training data provenance | Koud / developer community | ⏳ Ready |
| 4 | EUI (European University Institute) | Academisch / EU | Research data integriteit | Koud / academisch netwerk | ⏳ Ready |
| 5 | | | | | |

---

## Strategische onderbouwing per target

### Waarom deze drie organisaties in deze fase

Umarise zoekt de eerste **zichtbare integratie** — het equivalent van Shopify voor Stripe in 2014. De ideale eerste partner heeft drie eigenschappen:

1. **Zichtbaar** — anderen kijken ernaar en nemen het over
2. **Technisch** — kan zelf integreren, geen hand-holding nodig
3. **Narratief** — het gebruik vertelt een verhaal dat doorverteld wordt

---

### 2. GPT-NL — Sterkste strategische positie

**Wat het is:** Nederlands overheids-AI initiatief, gefinancierd door EZK, gericht op een soeverein taalmodel.

**Waarom ideaal voor Umarise:**
- **Compliance-driven:** AI Act vereist traceerbaarheid van training data. Anchoring bewijst welke data bestond vóór training.
- **Publiek narratief:** "De Nederlandse overheids-AI verankert zijn inputs" is een referentie die niemand negeert.
- **Overheidsvalidatie:** Als een overheidsinitiatief het gebruikt, verschuift de perceptie van "startup-tool" naar "infrastructuurstandaard."
- **Natuurlijke haak:** GPT-NL moet verantwoording afleggen over wat erin gaat. Umarise bewijst precies dat.

**Integratie-scenario:** Elke dataset die als training input dient wordt gehasht en verankerd. Bij audit: bewijs dat de data ongewijzigd was op moment van inname.

**Risico:** Overheidsprojecten bewegen langzaam. Besluitvorming kan maanden duren.

---

### 3. Mistral AI — Meest haalbare eerste integratie

**Wat het is:** Frans AI-bedrijf, bouwt open-source LLMs, EU-gevestigd, developer-cultuur.

**Waarom ideaal voor Umarise:**
- **Developer-cultuur:** Engineers die CLI-tools en open-source gewend zijn. De `umarise proof` workflow past naadloos.
- **Open-source ethos:** Transparantie over training data is een kernwaarde. Anchoring maakt die transparantie verifieerbaar.
- **EU AI Act:** Als Europees AI-bedrijf moeten ze compliance aantonen. Data provenance is geen nice-to-have, het wordt vereist.
- **Zichtbaarheid:** "Mistral verankert hun training data" bereikt elke AI-developer op Hacker News.

**Integratie-scenario:** `umarise proof dataset-v3.parquet` in hun data pipeline. Elke model release bevat een `.proof` file naast het model.

**Risico:** Laag. Technisch triviale integratie, cultureel passend. Uitdaging is het juiste contactpersoon vinden.

---

### 4. EUI (European University Institute) — Academische validatie

**Wat het is:** Pan-Europees academisch instituut in Florence, doet beleidsonderzoek voor de EU.

**Waarom ideaal voor Umarise:**
- **Research integriteit:** Academische data moet ongewijzigd reproduceerbaar zijn. Anchoring bewijst dat datasets op een specifiek moment bestonden.
- **Beleidsrelevantie:** EUI-onderzoek informeert EU-beleid. Als zij anchoring gebruiken, wordt het een standaard in policy research.
- **Publicatie-trail:** Elk paper kan een `.proof` file bevatten die de onderliggende data verankert. Peer reviewers kunnen verifiëren.
- **Institutioneel gewicht:** Academische adoptie geeft geloofwaardigheid die geen startup-referentie kan evenaren.

**Integratie-scenario:** Research datasets worden verankerd bij publicatie. De `.proof` file wordt onderdeel van het supplementary material.

**Risico:** Academische cycli zijn lang. Vereist een champion binnen het instituut die het initiatief drijft.

---

## Prioritering

| Criterium | GPT-NL | Mistral AI | EUI |
|---|---|---|---|
| **Snelheid van integratie** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Narratieve impact** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Technische match** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Bereikbaarheid** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Totaal** | 13/20 | 17/20 | 10/20 |

**Aanbeveling:** Start met Mistral AI (hoogste haalbaarheid), gebruik dat resultaat als referentie voor GPT-NL (hoogste impact).

---

## Trigger-momenten om naar te zoeken


---

## Referral Vraag (na succesvolle pilot)

> "Ken je iemand in je netwerk die recent te maken had met een situatie 
> waarin bewijs van de originele versie cruciaal was?"

---

*Template versie: 1.0 — Januari 2026*
