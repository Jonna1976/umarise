# Dual Demo Strategie - Backend Switching

## Overzicht

Umarise ondersteunt twee backends die per demo geswitcht kunnen worden:

| Backend | Doel | Publiek |
|---------|------|---------|
| **Lovable Cloud** | Product/UX demo, bestaande data | Consumers, algemene pitch |
| **Hetzner Vault** | Privacy/Sovereignty pitch | Enterprise, privacy-conscious |

## Snel Switchen

### Optie 1: Via UI (Aanbevolen voor demos)
1. Zet **Demo Mode** aan (klik op "Jonna" → wordt "Demo")
2. Er verschijnt een extra knop: **Cloud** of **Vault**
3. Klik om te wisselen (pagina herlaadt automatisch)

### Optie 2: Via Browser Console
```javascript
// Switch naar Hetzner Vault
localStorage.setItem('umarise_hetzner_enabled', 'true');
location.reload();

// Switch naar Lovable Cloud
localStorage.setItem('umarise_hetzner_enabled', 'false');
location.reload();

// Check huidige backend
localStorage.getItem('umarise_hetzner_enabled');
```

### Optie 3: Via Environment Variable
```bash
# In .env file
VITE_BACKEND_PROVIDER=hetzner  # Voor Hetzner
VITE_BACKEND_PROVIDER=lovable  # Voor Lovable Cloud (of weglaten)
```

## Endpoints

### Lovable Cloud
- Storage: Supabase Storage (automatisch)
- AI: Lovable AI via Edge Functions
- Database: Supabase PostgreSQL

### Hetzner Vault (vault.umarise.com)
- Vision API: `https://vault.umarise.com/api/vision/*`
- Storage API: `https://vault.umarise.com/api/codex/*`
- Health checks:
  - `https://vault.umarise.com/api/vision/health`
  - `https://vault.umarise.com/api/codex/health`

## Belangrijke Notities

1. **Data is gescheiden** - Pages op Lovable Cloud zijn niet zichtbaar in Hetzner mode en vice versa
2. **Geen migratie nodig** - Beide backends draaien onafhankelijk
3. **Risico geïsoleerd** - Als Hetzner faalt, switch je simpelweg terug
4. **Pitch per publiek**:
   - Consumers: "Snelle capture, AI-powered insights" → Cloud demo
   - Enterprise: "Data sovereignty, AES-256 encryption, self-hosted" → Vault demo

## Demo Checklist

### Voor Cloud Demo
- [ ] `localStorage.getItem('umarise_hetzner_enabled')` = `null` of `'false'`
- [ ] Demo mode aan (bestaande Jonna data)
- [ ] Test: capture, search, patterns werken

### Voor Vault Demo
- [ ] `localStorage.setItem('umarise_hetzner_enabled', 'true')`
- [ ] Health check: `curl https://vault.umarise.com/api/vision/health`
- [ ] Fresh start (geen bestaande data in Vault)
- [ ] Test: capture naar Hetzner, verify in logs
