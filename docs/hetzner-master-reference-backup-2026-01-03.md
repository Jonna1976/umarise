# HETZNER INFRASTRUCTURE — MASTER REFERENCE

**Server:** 94.130.180.233 (Falkenstein, Germany)  
**Last Updated:** January 3, 2026  
**Status:** ✅ Production Operational  
**Backup Date:** January 3, 2026 (Archive Copy)

---

## 🎯 QUICK REFERENCE

### What's Running:

| Service | Port | Purpose |
|---------|------|---------|
| Vision Service | 3341 | OCR + AI Analysis |
| Codex Service | 3342 | Storage + Search |
| Encryption | 3333 | AES-256-GCM |
| IPFS | 5001 | Distributed Storage |
| DataVault | 3340 | Image Upload (Docker) |

### Public Endpoint:

```
https://vault.umarise.com
```

### Authentication:

```
Authorization: Bearer vault_lovable_f4664ab12e634b2341331bf0e6c20c5e351e87753ef79c2e8dfdd5ea8a7baa57
```

---

## 📊 SERVICE OVERVIEW

| Service | Port | Type | Status | Location |
|---------|------|------|--------|----------|
| Vision | 3341 | Python/Flask | ✅ Running | /opt/vision-service/ |
| Codex | 3342 | Python/Flask | ✅ Running | /opt/codex-storage/ |
| Encryption | 3333 | Node.js | ✅ Running | systemd |
| DataVault | 3340 | Node.js | ✅ Running | Docker |
| IPFS | 5001 | Go | ✅ Running | Docker |
| PostgreSQL | 5434 | Database | ✅ Running | Docker |
| Redis | 6380 | Cache | ✅ Running | Docker |

---

## 🔧 CRITICAL SERVICES DETAIL

### 1. VISION SERVICE (Port 3341)

**Purpose:** OCR + AI Analysis (Gemini 2.5 Flash)  
**Location:** /opt/vision-service/

**Files:**
```
/opt/vision-service/
├── app.py          (10KB, Dec 19 11:05)
├── venv/           (Python environment)
└── requirements.txt
```

**Status Check:**
```bash
curl http://localhost:3341/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Vision Service",
  "version": "4.0.0",
  "model": "Gemini 2.5 Flash"
}
```

**Start/Stop:**
```bash
# Check if running
ps aux | grep "python /opt/vision-service/app.py"

# Start (if stopped)
cd /opt/vision-service
source venv/bin/activate
nohup python app.py > /var/log/vision-service.log 2>&1 &

# Stop
pkill -f "python /opt/vision-service/app.py"

# Logs
tail -f /var/log/vision-service.log
```

---

### 2. CODEX SERVICE (Port 3342)

**Purpose:** Page Storage + Search (SQLite + FTS5)  
**Location:** /opt/codex-storage/

**Files:**
```
/opt/codex-storage/
├── app.py          (16KB, Dec 19 11:02)
├── codex.db        (57KB, Jan 3 07:53) ← DATABASE
├── venv/           (Python environment)
└── app.py.backup-auth (backup with auth)
```

**Status Check:**
```bash
curl http://localhost:3342/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Codex Storage",
  "version": "1.1.0",
  "database": "SQLite with FTS5",
  "features": ["pages", "images", "search"]
}
```

**Database Operations:**
```bash
# Check page count
sqlite3 /opt/codex-storage/codex.db "SELECT COUNT(*) FROM pages;"

# List recent pages
sqlite3 /opt/codex-storage/codex.db "SELECT id, device_user_id, summary, created_at FROM pages ORDER BY created_at DESC LIMIT 5;"

# Backup database
cp /opt/codex-storage/codex.db /opt/backups/codex_$(date +%Y%m%d_%H%M%S).db
```

**Start/Stop:**
```bash
# Check if running
ps aux | grep "python /opt/codex-storage/app.py"

# Start (if stopped)
cd /opt/codex-storage
source venv/bin/activate
nohup python app.py > /var/log/codex-service.log 2>&1 &

# Stop
pkill -f "python /opt/codex-storage/app.py"

# Logs
tail -f /var/log/codex-service.log
```

**Authentication (in app.py lines 27-30):**
```python
TOKEN_PERMISSIONS = {
    "vault_lovable_f4664ab12e634b2341331bf0e6c20c5e351e87753ef79c2e8dfdd5ea8a7baa57": ["*"],
    "vault_admin_e94fe7c17cf99ab86255cda32393c472ca71b88ec2de67dd9e5e04f1a1f22683": ["*"]
}
```

---

### 3. ENCRYPTION SERVICE (Port 3333)

**Purpose:** AES-256-GCM Encryption/Decryption  
**Type:** Node.js service (systemd)

**Status Check:**
```bash
curl http://localhost:3333/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Encryption API",
  "version": "1.0-simple"
}
```

**Management:**
```bash
# Check systemd service
systemctl status encryption-service 2>/dev/null

# Check process
ps aux | grep -E "node.*3333|encryption"
```

---

### 4. DATAVAULT (Port 3340) — DOCKER

**Purpose:** IPFS Image Upload Gateway  
**Container:** umarise-plug-and-play_umarise-datavault_1

**Files:**
```
Inside container:
/app/app.js         (2KB, Jan 2 15:56)
/app/package.json
```

**Status Check:**
```bash
# Container status
docker ps | grep datavault

# Health check
curl http://localhost:3340/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "umarise-datavault",
  "version": "1.1.0"
}
```

**Management:**
```bash
# Restart container
docker restart umarise-plug-and-play_umarise-datavault_1

# View logs
docker logs umarise-plug-and-play_umarise-datavault_1 --tail 50

# Edit app.js (if needed)
docker exec -it umarise-plug-and-play_umarise-datavault_1 vi /app/app.js
```

---

### 5. IPFS (Port 5001) — DOCKER

**Purpose:** Distributed Content Storage  
**Container:** ipfs-node

**Status Check:**
```bash
# Container status
docker ps | grep ipfs

# Version check
curl http://localhost:5001/api/v0/version
```

**Management:**
```bash
# Restart
docker restart ipfs-node

# Logs
docker logs ipfs-node --tail 50
```

---

## 🌐 NGINX ROUTING

**Config:** `/etc/nginx/sites-enabled/vault.umarise.com`

**Key Routes:**
```nginx
# Image Upload (DataVault Docker)
location /api/vision/vault/images {
    proxy_pass http://127.0.0.1:3340/vault/images;
}

# Vision AI (Python Service)
location /api/vision/ai/ {
    proxy_pass http://127.0.0.1:3341/ai/;
}

# Codex Search (Python Service)
location /api/codex/ai/ {
    proxy_pass http://127.0.0.1:3342/ai/;
}

# Codex General (Python Service)
location /api/codex/ {
    proxy_pass http://127.0.0.1:3342/;
}
```

**Reload Nginx:**
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Check logs
tail -f /var/log/nginx/vault-audit.log
```

---

## 🔐 AUTHENTICATION

**Token (Lovable Frontend):**
```
vault_lovable_f4664ab12e634b2341331bf0e6c20c5e351e87753ef79c2e8dfdd5ea8a7baa57
```

**Usage:**
```bash
# All Codex/Vision API calls require:
Authorization: Bearer vault_lovable_f4664ab12e634b2341331bf0e6c20c5e351e87753ef79c2e8dfdd5ea8a7baa57
```

**Auth Bypass (if needed for testing):**
```python
# Edit /opt/codex-storage/app.py
# Line 47, add /ai/search to skip list:
if request.path in ["/health", "/ai/search"]:
    return None
```

---

## 📡 API ENDPOINTS (PRODUCTION)

### Search (Codex)

```http
POST https://vault.umarise.com/api/codex/ai/search
Authorization: Bearer vault_lovable_...
Content-Type: application/json

{
  "query": "budget",
  "deviceUserId": "uuid",
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "results": [{
    "id": "uuid",
    "matchType": "content",
    "ocrText": "text...",
    "score": 0.8,
    "summary": "summary..."
  }]
}
```

### Image Upload (DataVault)

```http
POST https://vault.umarise.com/api/vision/vault/images
Content-Type: application/json

{
  "imageDataUrl": "data:image/jpeg;base64,...",
  "deviceUserId": "uuid",
  "encrypt": false
}
```

**Response:**
```json
{
  "imageUrl": "ipfs://Qm...",
  "encrypted": false,
  "thumbnailUrl": null
}
```

---

## 🗄️ BACKUPS

**Location:** /opt/backups/  
**Automated:** Daily at 03:00 (cron)

**Manual Backup:**
```bash
# Codex database
cp /opt/codex-storage/codex.db /opt/backups/codex_$(date +%Y%m%d_%H%M%S).db.gz

# List backups
ls -lh /opt/backups/ | tail -10
```

**Restore:**
```bash
# Stop service
pkill -f "python /opt/codex-storage/app.py"

# Restore
gunzip -c /opt/backups/codex_20260103_030001.db.gz > /opt/codex-storage/codex.db

# Restart
cd /opt/codex-storage
source venv/bin/activate
nohup python app.py > /var/log/codex-service.log 2>&1 &
```

---

## 🔧 TROUBLESHOOTING

### Service Not Responding:

**1. Check if running:**
```bash
ps aux | grep -E "vision|codex|app.py"
netstat -tulpn | grep -E "3341|3342"
```

**2. Check logs:**
```bash
tail -50 /var/log/vision-service.log
tail -50 /var/log/codex-service.log
```

**3. Restart service:**
```bash
# Vision
pkill -f "python /opt/vision-service/app.py"
cd /opt/vision-service && source venv/bin/activate
nohup python app.py > /var/log/vision-service.log 2>&1 &

# Codex
pkill -f "python /opt/codex-storage/app.py"
cd /opt/codex-storage && source venv/bin/activate
nohup python app.py > /var/log/codex-service.log 2>&1 &
```

### Auth Errors:

**Symptom:** `{"error": "Unauthorized - missing token"}`

**Solution:**
```bash
# Check if token sent in header
# Header must be:
Authorization: Bearer vault_lovable_f4664ab12e634b2341331bf0e6c20c5e351e87753ef79c2e8dfdd5ea8a7baa57

# Verify token in app.py
grep "TOKEN_PERMISSIONS" /opt/codex-storage/app.py
```

### Database Locked:

**Symptom:** `database is locked`

**Solution:**
```bash
# Check for stale locks
lsof /opt/codex-storage/codex.db

# Kill blocking process (if safe)
pkill -f "python /opt/codex-storage/app.py"

# Restart
cd /opt/codex-storage && source venv/bin/activate
nohup python app.py > /var/log/codex-service.log 2>&1 &
```

### IPFS Upload Fails:

**Symptom:** Image upload returns error

**Check:**
```bash
# IPFS container running?
docker ps | grep ipfs

# IPFS API accessible?
curl http://localhost:5001/api/v0/version

# Restart IPFS
docker restart ipfs-node
```

---

## 📊 MONITORING

### Quick Health Check (All Services):

```bash
#!/bin/bash
echo "=== HETZNER HEALTH CHECK ==="
echo ""

echo "Vision (3341):"
curl -s http://localhost:3341/health | jq -r '.status'

echo "Codex (3342):"
curl -s http://localhost:3342/health | jq -r '.status'

echo "Encryption (3333):"
curl -s http://localhost:3333/health | jq -r '.status'

echo "DataVault (3340):"
curl -s http://localhost:3340/health | jq -r '.status'

echo ""
echo "Database Pages:"
sqlite3 /opt/codex-storage/codex.db "SELECT COUNT(*) FROM pages;"

echo ""
echo "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "datavault|ipfs|postgres"
```

**Save as:** `/root/health-check.sh`

---

## 🚀 DEPLOYMENT CHECKLIST

### After Server Restart:

```bash
# 1. Check Docker containers started
docker ps

# 2. Start Vision service
cd /opt/vision-service
source venv/bin/activate
nohup python app.py > /var/log/vision-service.log 2>&1 &

# 3. Start Codex service
cd /opt/codex-storage
source venv/bin/activate
nohup python app.py > /var/log/codex-service.log 2>&1 &

# 4. Verify all services
curl http://localhost:3341/health
curl http://localhost:3342/health
curl http://localhost:3333/health
curl http://localhost:3340/health

# 5. Test HTTPS endpoint
curl https://vault.umarise.com/api/codex/ai/search \
  -H "Authorization: Bearer vault_lovable_..." \
  -H "Content-Type: application/json" \
  -d '{"query":"test","deviceUserId":"test","limit":1}'
```

---

## 📝 IMPORTANT FILES

| File | Purpose | Backup? |
|------|---------|---------|
| /opt/codex-storage/codex.db | Main database | ✅ Daily |
| /opt/codex-storage/app.py | Codex service code | ✅ On change |
| /opt/vision-service/app.py | Vision service code | ✅ On change |
| /etc/nginx/sites-enabled/vault.umarise.com | Nginx config | ✅ On change |
| /var/log/codex-service.log | Codex logs | ❌ Rotated |
| /var/log/vision-service.log | Vision logs | ❌ Rotated |

---

## 🔗 EXTERNAL DEPENDENCIES

| Service | Provider | Purpose |
|---------|----------|---------|
| Gemini 2.5 Flash | Google AI | OCR + Analysis |
| Let's Encrypt | ACME | SSL Certificates |
| IPFS Network | Public | Content Distribution |

---

## ⚠️ WHAT NOT TO DO

### ❌ Never:
- Delete /opt/codex-storage/codex.db (main database)
- Edit app.py without backup
- Restart services during pilot (unless critical)
- Disable auth in production (only for local testing)
- Run docker-compose down (loses data)

### ✅ Always:
- Backup database before changes
- Test changes locally first
- Keep auth tokens secret
- Monitor logs after restart
- Check health endpoints after deployment

---

## 📞 EMERGENCY CONTACTS

### If Services Down:
1. Check logs: `/var/log/codex-service.log`, `/var/log/vision-service.log`
2. Check processes: `ps aux | grep -E "vision|codex"`
3. Check docker: `docker ps`
4. Restart services (see Deployment Checklist)

### If Database Corrupted:
1. Stop Codex service
2. Restore from /opt/backups/
3. Restart service
4. Verify with health check

### If Nginx Issues:
1. Check config: `nginx -t`
2. Check logs: `/var/log/nginx/error.log`
3. Reload: `systemctl reload nginx`

---

## 📅 VERSION HISTORY

| Date | Change | By |
|------|--------|-----|
| 2026-01-03 | Initial production deployment | System |
| 2026-01-03 | Added auth tokens for Lovable | System |
| 2026-01-03 | Confirmed search endpoint working | Lovable |

---

## ✅ PRODUCTION STATUS

**Last Verified:** January 3, 2026 08:16 UTC

### Services Status:
- Vision (3341): ✅ Healthy
- Codex (3342): ✅ Healthy
- Encryption (3333): ✅ Healthy
- DataVault (3340): ✅ Healthy
- IPFS (5001): ✅ Healthy

### Database:
- Pages: 9
- Last backup: Jan 3 03:00
- Size: 57KB

### Endpoints:
- Image upload: ✅ Working
- Search: ✅ Working (tested with "love", "frustration")
- Auth: ✅ Working (token validated)

---

## 📊 ARCHITECTURE OVERVIEW

### Service Flow:

```
FRONTEND (Lovable React PWA)
         ↓ HTTPS
vault.umarise.com (SSL: Let's Encrypt)
         ↓
   NGINX GATEWAY (Port 443)
         ↓ Routes by path
   ┌─────┴─────────────────────┐
   ↓                           ↓
PYTHON SERVICES            DOCKER SERVICES
├─ Vision (3341)           ├─ DataVault (3340)
├─ Codex (3342)            ├─ IPFS (5001)
└─ Encryption (3333)       ├─ PostgreSQL (5434)
                           └─ Redis (6380)
```

### Routing Table:

| Path | Destination |
|------|-------------|
| /api/vision/vault/images | DataVault :3340 |
| /api/vision/ai/* | Vision :3341 |
| /api/codex/ai/* | Codex :3342 |
| /api/codex/* | Codex :3342 |

### Data Storage:

| Type | Storage | Location |
|------|---------|----------|
| Images | IPFS Network | ipfs://Qm... |
| Metadata | SQLite | /opt/codex-storage/codex.db |
| Search Index | SQLite FTS5 | ocr_text, summary, keywords |
| Backups | File System | /opt/backups/ (Daily 03:00) |

---

## 🔐 AUTHENTICATION FLOW

```
Frontend Request
    ↓
Authorization: Bearer vault_lovable_...
    ↓
Nginx (Port 443) → Forwards headers
    ↓
Codex Service (Port 3342)
    ↓
Token Validation Check
    ├─ Valid → Process Request → Return Data
    └─ Invalid → 401 Unauthorized
```

---

## 📊 CAPTURE FLOW (Image Upload)

```
1. User → Take photo
2. Frontend → Convert to base64
3. Frontend → POST /api/vision/vault/images + Auth Token
4. Nginx → Forward to DataVault :3340
5. DataVault → Upload to IPFS
6. IPFS → Return ipfs://Qm...
7. DataVault → Return imageUrl to Frontend
8. Frontend → POST /api/vision/ai/analyze + imageUrl
9. Nginx → Forward to Vision :3341
10. Vision → OCR (Gemini 2.5)
11. Vision → Return {ocrText, summary, keywords}
12. Frontend → POST /api/codex/vault/pages + all data
13. Nginx → Forward to Codex :3342
14. Codex → INSERT page
15. Codex → Return {id, createdAt}
16. Frontend → ✅ Captured!
```

---

## 🔍 SEARCH FLOW (Retrieval)

```
1. User → Type query: "budget"
2. Frontend → POST /api/codex/ai/search
   Auth: Bearer token
   {query, deviceUserId, limit}
3. Nginx → Forward to Codex :3342
4. Codex → Validate token
5. Codex → SELECT * FROM pages
   WHERE device_user_id = ?
   AND (ocr_text LIKE ? OR summary LIKE ?)
6. Database → Return matching rows
7. Codex → Format results
   {id, summary, ocrText, matchType, score}
8. Codex → Return {success: true, results: [...]}
9. Frontend → Map to display format
10. Frontend → ✅ Show original scan + metadata
```

---

## 🎯 PILOT READY — All systems operational

---

*This is an archive copy from the original .pages document dated January 3, 2026.*
