# AssetOrbit: Enterprise IT Asset & Subscription Management System
> **Production-Grade ITAM, SaaS Cost Optimization, Lab Life-Cycle Intelligence & Zero-Trust Sentinel**

AssetOrbit is a modern, enterprise SaaS web application engineered for IT enterprises and academic institutions (specifically tailored for college departments like **CSE, ISE, ECE, Mechanical, and Campus Data Centers**). It streamlines hardware provisioning, real-time lab workstation health monitoring, QR verification, live SLA countdowns, SaaS license reclamation, price hike detection, shadow IT defense, certified NIST 800-88 e-waste compliance, and full disaster recovery.

---

## 🚀 Live Demo & Ready for Vercel Deployment

AssetOrbit is 100% pre-configured for instant zero-configuration hosting on **Vercel**:
- Includes `vercel.json` with single-page application rewrites.
- Fast build with zero external build blockers.
- Persistent state engine backed by browser LocalStorage & IndexedDB with JSON backup/restore.
- Full relational database DDL provided in `database/schema.sql` (compatible with PostgreSQL, Supabase, Neon, and MySQL).

---

## 🌟 Key Architecture & Capabilities

### 1. 🏢 College Department & Lab Bench Visualizer (CSE / ISE / ECE)
- **Interactive Lab Workstation Matrix**: Visual floorplans for:
  - **CSE Lab 1 (Alan Turing Systems & OS Lab - Room 301, 30 Benches)**
  - **CSE Lab 2 (Ada Lovelace AI & Machine Learning Lab - Room 302, 25 Benches)**
  - **ISE Lab 1 (Cloud & Network Security Lab - Room 204, 25 Benches)**
  - **ECE Lab 1 (DSP & VLSI Synthesis Lab - Room 105, 20 Benches)**
  - **ECE Lab 2 (Microcontrollers & Embedded Systems Lab - Room 106, 20 Benches)**
  - **Mechanical Lab 1 (CAD/CAM High-End GPU Workstations - Room 008, 15 Benches)**
- **Real-Time Bench Status Indicators**:
  - 🟢 **Green**: Healthy & Online (Health Score > 80%, No active incidents)
  - 🟡 **Yellow**: Degraded / High Temp / Minor fault
  - 🔴 **Red**: In Repair / Active Critical Helpdesk Ticket
  - 🟣 **Indigo**: Standby Loaner Assigned
- **Deep-Dive Workstation Inspection**: Click any bench to view full processor specs (Core i7 / i9 / Xeon), RAM, dual-boot OS (Ubuntu 22.04 LTS / Win 11), static IP address, MAC address, and active issues.

### 2. 📦 Asset Provisioning with Quantity Batch Generator
- **Quantity Field Batch Provisioning**: When entering `Quantity = 10` (or `30` for an entire college lab batch), AssetOrbit automatically creates 10 individual unique asset records with sequential IDs (`AST-CSE-001` through `AST-CSE-010`), sequential serial numbers, designated bench allocations, and unique QR codes linked under a unified `batchId`.
- **First-Run CSV Import Wizard**: Download official CSV templates for **Assets, Subscriptions, Vendors, and Users**. Validate columns, preview rows, and commit real college department datasets.
- **One-Click "Load College Labs Data"**: Optional button to instantly populate realistic fixtures for demonstration.

### 3. 📷 QR Code System & In-Browser Web Camera Scanner
- **Bulk Printable QR Sheet**: Formatted A4 sticker sheet (2x4 / 3x6 layout) ready for printer output with asset ID, serial number, college department, and QR tag.
- **In-Browser Web Camera Scanner**: Uses HTML5 MediaDevices video stream with overlay reticle.
- **Simulated Quick-Scanner**: Test scanner without camera hardware by simulating immediate scans of any lab workstation.
- **Instant Scan Actions**: View Asset Profile, Report Helpdesk Ticket, Check-in / Check-out, and Verify in Physical Audit.

### 4. ⏱️ Helpdesk Workflow with Live SLA Countdown Timers
- **Strict SLA Response & Resolution Targets**:
  - **Critical**: 4-Hour Resolution (Color-coded live countdown; blinks red on breach)
  - **High**: 8-Hour Resolution
  - **Medium**: 24-Hour Resolution
  - **Low**: 72-Hour Resolution
- **Kanban & Table Views**: Track stages from Open → Assigned → In Progress → Waiting for Parts → Resolved → Closed.
- **Technician Guided Resolution Modal**:
  - Interactive diagnostic checklist (RAM reseating, thermal paste replacement, BIOS error codes, OS kernel updates).
  - Action selection: In-house repair, 1-click issue standby loaner, or vendor warranty RMA.
  - Cost tracking (spare parts cost + labor cost).
  - Resolution root cause summary and 5-star user satisfaction confirmation.

### 5. 🔁 Standby Loaner Pool & Auto Swap-Back
- Dedicated pool of emergency laptops and workstations (e.g. Dell Latitude 5420).
- 1-click assignment when a primary workstation is sent for repair.
- Automated return reminder alerts and overdue badges.
- **Automatic Swap-Back**: When the primary ticket is resolved, system prompts to check-in the loaner and restore the primary workstation to the user/bench.

### 6. 💳 SaaS License Optimization & Price Hike Detection
- **Campus Subscription Tracking**: MATLAB Campus-Wide, Microsoft 365 Education A5, JetBrains Academic, Cadence EDA, SolidWorks Education, Turnitin, Zoom Pro.
- **Unused License Reclaim**: Telemetry detects seats inactive for >90 days, calculates annual recoverable dollars ($), and allows 1-click license pool reclamation.
- **Automatic Price Hike Sentinel**: Automatically compares renewal quotes against historical agreements. Alerts when vendor costs jump (e.g. `+14.2% on MATLAB renewal`) and generates annual financial impact audits.
- **Platform Pricing Plans Page**: Comprehensive SaaS plans for AssetOrbit itself (College Lab / Starter, Department / Pro, University / Enterprise) with Monthly/Yearly toggle (20% discount), feature comparison matrix, and simulated purchase order checkout.

### 7. 🛡️ Zero-Trust Shadow IT Detection
- Import network logs, browser usage files, or click "Simulate Live Anomaly Feed".
- Compares against the approved institutional software catalogue.
- Flags unapproved software (BitTorrent, personal cloud syncs, unauthorized ChatGPT API tokens, remote desktop proxies) with risk scores (0-100) and threat reasons.
- Actions: **Approve Tool**, **Block & Quarantine**, or **Request Security Review**.

### 8. 🚨 Loss & Theft Incident Workflow
- Multi-tier formal sign-off: **Reporter → Department Head (HOD) → IT Admin**.
- Police FIR report number logging and document evidence attachment.
- Automatic device remote lock and status update to `Stolen` / `Lost`.
- Insurance claim tracking ($ payout estimate) and 1-click "Mark Recovered" workflow.

### 9. ♻️ Certified E-Waste & NIST 800-88 Data Wiping
- Mark decommissioned hardware as E-Waste.
- Data sanitization checklist per **NIST SP 800-88 Rev 1 (3-Pass DoD Overwrite & Degaussing)**.
- Environmental impact telemetry: **Total E-Waste kg diverted**, **$CO_2e$ carbon offset estimate**, and **toxic lead/mercury diverted**.
- Printable formal Disposal Certificate for Pollution Control Board audits.

### 10. 🔍 Physical Audit Mode & Discrepancy Reconciliation
- Select a lab (e.g. `CSE Lab 1 - Room 301`).
- Scan QR codes of physical hardware on lab benches.
- Live automated reconciliation into:
  - ✅ **Verified in Lab**
  - ⚠️ **Missing from Bench**
  - 🚨 **Misplaced Assets Found** (Assets belonging to a different lab)

### 11. 📉 Depreciation Calculator & Total Cost of Ownership (TCO)
- Calculates asset amortization using **Straight-Line** and **Double-Declining Balance** methods.
- Displays initial cost, residual salvage value, accumulated depreciation, and current net book value.

### 12. 💾 Full Disaster Recovery & Backup System
- 1-Click "Export Full JSON Backup" generating timestamped snapshots.
- JSON Restore wizard with integrity check and overwrite confirmation.
- System activity audit trail.

---

## 👥 Role-Based Access Control (RBAC)

Use the top **Demonstration Role Switcher Bar** to test permissions across all 5 roles:
| Role | Permissions & Access Scope |
|---|---|
| **Super Admin** | Full access to all modules, system settings, category editor, database backup & restore. |
| **Admin / IT Manager** | Provision assets, manage batches, resolve helpdesk tickets, manage loaners, shadow IT, e-waste. |
| **Department Head (HOD)** | Approve ticket escalations, approve loss/theft reports, approve replacement Capex, view lab health. |
| **Employee / Lab Assistant** | Log helpdesk tickets, view assigned benches/hardware, request loaners. |
| **Auditor** | Read-only inspection of inventory, discrepancy reports, financial depreciation, and e-waste certificates. |

---

## 🛠️ Local Development & Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **pnpm**

### Installation
```bash
# 1. Unzip the downloaded AssetOrbit-Production.zip
cd asset-orbit

# 2. Install dependencies (if not using pre-bundled node_modules)
npm install

# 3. Start local development server
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🌐 Deploying to Vercel (1-Click)

1. Push your repository to GitHub or upload the unzipped folder.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select the repository:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**! The app will deploy in under 30 seconds with complete functionality.

---

## 🗄️ Database Schema & SQL Migration

A complete relational database DDL is provided in [`database/schema.sql`](./database/schema.sql). It can be directly executed in:
- **Supabase SQL Editor**
- **Neon PostgreSQL Console**
- **Standard PostgreSQL or MySQL CLI**

Tables include:
- `users` (RBAC, email, hashed credentials)
- `categories`, `sub_branches`, `college_labs`
- `vendors`
- `asset_batches` & `assets` (Specs in JSONB, health scores, QR tags)
- `asset_timeline_events`
- `subscriptions` & `subscription_price_history`
- `tickets`, `ticket_checklist_items`, `ticket_notes`
- `shadow_it_logs`
- `e_waste_records`
- `loss_theft_reports`
- `system_activity_logs`

---

## 📄 License
AssetOrbit is licensed under the MIT License. Built with pride for engineering colleges and enterprise IT departments.
