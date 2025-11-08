# 📱 DEVICE INVENTORY - CODIA V10

**Purpose:** Insurance, warranty tracking, depreciation, security  
**Last Updated:** Nov 7, 2025  
**Source:** ULTIMATE-PHASE1-MASTER-VISUAL.mmd

---

## 👤 FOUNDER 1 - HÙNG (Tech/Media/Fundraising)

**Email:** grootknow@gmail.com (personal), hung@rootknow.com (work), admin@rootknow.com (admin)  
**Phone:** [Personal] + [Work eSIM]  
**Access:** SUPER ADMIN (Full - All VPS root, all databases, all services, all credentials, all media accounts)

### LG Gram 2022
- **Type:** Laptop (Primary Development)
- **Serial:** [PENDING]
- **Purchase Date:** [PENDING]
- **Warranty Expires:** [PENDING]
- **Specs:** 32GB RAM, 256GB SSD
- **OS:** Windows 11 Pro
- **Role:** Primary development, Windsurf IDE, Docker testing, SSH to VPS

### Workstation i9-12900K
- **Type:** Desktop Workstation (Beast Machine)
- **Serial:** [PENDING]
- **Purchase Date:** [PENDING]
- **Warranty Expires:** [PENDING]
- **Specs:** Intel i9-12900K CPU, 64GB RAM, 35TB Storage
- **OS:** Windows 11 Pro
- **Role:** Heavy workloads, 4K/8K video editing, AI model training, local development, massive storage

### Xiaomi 14T Pro ⚠️ PRIMARY 2FA
- **Type:** Mobile (CRITICAL DEVICE)
- **Serial:** [PENDING]
- **Purchase Date:** [PENDING]
- **Warranty Expires:** [PENDING]
- **Specs:** [Storage - check device]
- **OS:** Android 14
- **Role:** **PRIMARY 2FA DEVICE** - All MFA codes, Authy (work phone), authenticator apps
- **CRITICAL:** DO NOT LOSE! Recovery codes in Vaultwarden paper backup in safe

### Professional Media Equipment ($20K Total)
- **Type:** Production Equipment
- **Items:**
  - **Cameras:**
    - Sony A7S III (full-frame mirrorless)
    - Canon R6 (full-frame mirrorless)
  - **Lighting:**
    - Aputure light panels
    - Softboxes, diffusers
  - **Audio:**
    - Rode wireless microphones
    - Sennheiser audio equipment
  - **Storage:**
    - Synology DS923+ NAS with 24TB (RAID 5)
- **Serial Numbers:** [PENDING - Document each item separately]
- **Insurance:** [PENDING - Insure for full $20K value]
- **Purpose:** YouTube/TikTok/Instagram video/photo production

---

## 👤 FOUNDER 2 - TUẤN (Operations/Finance)

**Email:** drootknow@gmail.com (personal), tuan@rootknow.com (work)  
**Phone:** 0977078336  
**Location:** Hà Đông, Hà Nội  
**Access:** ADMIN (Limited - Grafana view, Notion full, Finance reports read, LinkedIn Company admin)  
**Restrictions:** ❌ No VPS SSH, ❌ No database write, ❌ No code deployment

### WorkPC 2025
- **Type:** Desktop PC
- **Serial:** [PENDING]
- **Purchase Date:** 2025 [exact date pending]
- **Warranty Expires:** [PENDING]
- **Specs:** [PENDING - CPU, RAM, Storage]
- **OS:** Windows 11 Pro
- **Role:** Operations, finance tracking, Grafana monitoring, Notion management

### Xiaomi 15T Pro
- **Type:** Mobile
- **Serial:** [PENDING]
- **Purchase Date:** [PENDING]
- **Warranty Expires:** [PENDING]
- **Specs:** [Storage - check device]
- **OS:** Android 14
- **Role:** Communications, backup 2FA, mobile operations

---

## 📊 SUMMARY

**Total Devices:** 6 (3 computers + 2 phones + 1 equipment bundle)  
**Hùng:** 3 devices + equipment  
**Tuấn:** 2 devices  
**Primary 2FA:** Hùng's Xiaomi 14T Pro ⚠️  
**Total Equipment Value:** ~$25K ($5K devices + $20K media equipment)

---

## 🔒 SECURITY & ACCESS

### Hùng (SUPER ADMIN):
- ✅ All VPS SSH access (root)
- ✅ All database admin access
- ✅ All service owner access
- ✅ All credentials in Vaultwarden (master)
- ✅ All media account access
- ✅ GitHub, Cloudflare, Contabo, all infrastructure

### Tuấn (ADMIN Limited):
- ✅ Grafana (view dashboards)
- ✅ Notion (full access)
- ✅ Finance reports (read-only)
- ✅ LinkedIn Company (admin)
- ❌ VPS SSH (no access)
- ❌ Database write (no access)
- ❌ Code deployment (no access)

### 2FA Strategy:
- **Primary:** Hùng's Xiaomi 14T Pro (Authy on work phone)
- **Backup:** Recovery codes in Vaultwarden
- **Paper Backup:** 10 recovery codes → paper → physical safe
- **Master Password:** Paper in safe (Vaultwarden master account: admin@rootknow.com)

---

## 💾 DATABASE SCHEMA

**Table:** `equipment`

```sql
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  owner VARCHAR(10) NOT NULL CHECK (owner IN ('Hùng', 'Tuấn')),
  device_type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100),
  purchase_date DATE,
  warranty_expires DATE,
  specs JSONB,
  os VARCHAR(50),
  role TEXT,
  is_primary_2fa BOOLEAN DEFAULT false,
  value_usd INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Example inserts
INSERT INTO equipment (owner, device_type, name, specs, os, role, is_primary_2fa, value_usd) VALUES
('Hùng', 'laptop', 'LG Gram 2022', '{"ram": "32GB", "storage": "256GB"}', 'Windows 11 Pro', 'Primary development', false, 1500),
('Hùng', 'workstation', 'i9-12900K Workstation', '{"cpu": "i9-12900K", "ram": "64GB", "storage": "35TB"}', 'Windows 11 Pro', 'Heavy workloads, video editing', false, 3000),
('Hùng', 'mobile', 'Xiaomi 14T Pro', '{}', 'Android 14', 'Primary 2FA device', true, 500),
('Hùng', 'equipment', 'Media Production Bundle', '{"cameras": "Sony A7S III + Canon R6", "nas": "Synology 24TB"}', null, 'Video/photo production', false, 20000),
('Tuấn', 'desktop', 'WorkPC 2025', '{}', 'Windows 11 Pro', 'Operations, finance', false, 1000),
('Tuấn', 'mobile', 'Xiaomi 15T Pro', '{}', 'Android 14', 'Communications', false, 500);
```

---

## ✅ ACTION ITEMS

**For Hùng:**
1. Fill in serial numbers for all devices
2. Document media equipment serials (Sony, Canon, NAS)
3. Purchase insurance for $20K+ equipment
4. Store recovery codes in safe
5. Test backup 2FA on secondary device

**For Tuấn:**
1. Fill in WorkPC 2025 specs
2. Add Xiaomi 15T Pro serial
3. Setup backup 2FA

**For Cascade:**
- ✅ Documentation updated with REAL devices
- ✅ Database schema created
- ⏳ Awaiting serial numbers from founders
- ⏳ Will verify via equipment table query

---

**Status:** ✅ Template with REAL data  
**Next:** Founders add serial numbers & dates  
**Source:** ULTIMATE-PHASE1-MASTER-VISUAL.mmd (ground truth)
