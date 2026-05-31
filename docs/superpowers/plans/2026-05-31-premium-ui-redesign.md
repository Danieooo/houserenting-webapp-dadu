# Premium UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the frontend of House Renting App using Modern Cobalt & Cream theme with Outfit typography to be extremely premium and tactile, validated by Playwright.

**Architecture:** Extend Tailwind config, load Outfit Google font, and rebuild Rooms, Tenants, and Invoices components using Bento layouts and micro-interactions.

**Tech Stack:** React 18, Tailwind CSS v3, Outfit Google Fonts, Playwright E2E.

---

### Task 1: Setup & Design Tokens Configuration

**Files:**
- Modify: [index.html](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/index.html)
- Modify: [tailwind.config.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/tailwind.config.js)
- Modify: [index.css](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/index.css)

- [ ] **Step 1: Load Outfit Font in index.html**
  Add Google Fonts link element inside `<head>`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ```

- [ ] **Step 2: Extend Tailwind Configuration**
  Extend `tailwind.config.js` to include the `Outfit` font and Custom Cobalt/Cream colors:
  ```javascript
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        cream: {
          warm: '#FDFBF7',
        },
        cobalt: {
          royal: '#0052CC',
        }
      }
    }
  }
  ```

- [ ] **Step 3: Update Global CSS variables**
  Set primary backgrounds to `#FDFBF7` in `index.css`:
  ```css
  body {
    background-color: #FDFBF7;
    font-family: 'Outfit', sans-serif;
  }
  ```

- [ ] **Step 4: Verify Local dev build**
  Run: `cd frontend && npm run dev`
  Expected: Dev server runs cleanly, font Outfit is applied, custom backgrounds display.

---

### Task 2: Rebuild Rooms Page to Bento Grid Cards

**Files:**
- Modify: [RoomsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/RoomsPage.jsx)
- Modify: [RoomDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/RoomDetailPage.jsx)

- [ ] **Step 1: Redesign RoomsPage Listing Grid**
  Replace the standard table with a Bento-style grid card layout.
  ```jsx
  // Each Room Card must have:
  className="bg-white rounded-2xl border border-slate-100 p-6 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-all duration-300"
  ```

- [ ] **Step 2: Add Pastel Tags for Statuses**
  Replace standard badges with high-end pastel variants:
  - `AVAILABLE`: `bg-emerald-50 text-emerald-700 border border-emerald-200/50`
  - `OCCUPIED`: `bg-rose-50 text-rose-700 border border-rose-200/50`
  - `MAINTENANCE`: `bg-amber-50 text-amber-700 border border-amber-200/50`

- [ ] **Step 3: Rebuild RoomDetailPage Split-Screen**
  Apply 50/50 Desktop split view. Left side holds the room data Bento grid, right side houses history tabs.

- [ ] **Step 4: Run Playwright Verification**
  Run: `cd frontend && npx playwright test e2e/happy-path.spec.js`
  Expected: All E2E happy path tests pass seamlessly.

---

### Task 3: Redesign Tenants Profile and Document Dropzone

**Files:**
- Modify: [TenantsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/TenantsPage.jsx)
- Modify: [TenantDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/TenantDetailPage.jsx)

- [ ] **Step 1: Rebuild Tenants Cards Grid**
  Update standard tenant grid cards with premium bo-góc `rounded-2xl`, tactile scale transitions and cream highlights.

- [ ] **Step 2: Modernize Dropzone Drop Area**
  Refactor the scan document upload area into a premium cobalt dashed-border region:
  ```jsx
  className="border-dashed border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl p-8 transition-all duration-200 active:scale-[0.99] cursor-pointer"
  ```

- [ ] **Step 3: Run Playwright Validation**
  Run: `cd frontend && npx playwright test e2e/happy-path.spec.js`
  Expected: PASS

---

### Task 4: Redesign Invoice Details and Add Glassmorphism Notification Dialog

**Files:**
- Modify: [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx)

- [ ] **Step 1: Rebuild Invoice Details Card**
  Redesign the main invoice component into a beautiful minimalist E-Invoice style:
  - Background: Pure white `#FFFFFF` surface on a `#FDFBF7` container.
  - Border: thin dashed gray/cream dividers instead of solid black lines.

- [ ] **Step 2: Add Glassmorphic Overlays to share Dialog**
  Overlay popup must have:
  ```jsx
  className="backdrop-blur-md bg-white/75 border border-white/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
  ```

- [ ] **Step 3: Style tactile share buttons**
  Apply premium active lún transitions `active:scale-[0.97]` and hover highlights `hover:bg-blue-50/50 hover:border-blue-200/50` to Copy, Zalo, SMS and Webhook channels.

- [ ] **Step 4: Run E2E Verification Suite**
  Run: `cd frontend && npx playwright test e2e/`
  Expected: all 3 test files (happy path, notifications, qr-validation) pass successfully.

---

### Task 5: Governance Sync & Changelog Documentation

**Files:**
- Modify: [AGENTS.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/AGENTS.md)
- Modify: [CHANGELOG.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/CHANGELOG.md)

- [ ] **Step 1: Record update to AGENTS.md**
  Update Status, Milestone, and versioning to `1.4.2` including the Premium UI Redesign deliverables.

- [ ] **Step 2: Record detailed modifications in CHANGELOG.md**
  List all modified design tokens, rebuilt page layouts and verification runs.

- [ ] **Step 3: Build production bundle**
  Run: `cd frontend && npm run build`
  Expected: Compilation succeeds with zero errors.
