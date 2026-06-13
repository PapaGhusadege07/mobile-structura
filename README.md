# Structura — Smart Structural Design & Cost Estimation

Structura (formerly StructuraScan / Structural Design Pro) is a mobile-first web application built for the Indian construction market. It combines IS 456:2000–compliant structural design, 2D detailing, 3D reinforcement visualization, bar bending schedules, live material pricing, cost estimation, project scheduling, drainage tools and structural health monitoring into a single PWA-style experience.

> Live preview: https://mobile-structura.lovable.app

---

## ✨ Features

### 1. IS 456:2000 Structural Design
- **Singly reinforced RCC beams** — accurate `Ast` calculation using
  `Ast = (0.5·fck·b·d / fy) · [1 − √(1 − 4.6·Mu / (fck·b·d²))]`
- **Columns, slabs, footings** — axial, flexure & punching shear checks
- Shear design with τc from IS 456 Table 19 (no assumed values)
- Stirrup spacing computed from `Sv = (0.87·fy·Asv·d) / Vs`
- Min/max steel %, development length, deflection (L/d) checks
- Compliance checker that flags every code clause violated

### 2. Detailing & Visualization
- **2D Drawing** view (longitudinal section + cross section)
- **3D Reinforcement Viewer** (`@react-three/fiber` + `drei`) with
  `OrbitControls`, `Environment`, ground plane and proper lighting
- **Curtailed bars** (no bent-up bars) rendered as a `CurtailedBar`
  component using `actualHeight = min(value, threshold)` and a
  semi-transparent overlay box for the curtailed portion
- Toggle between *Structural View* and *Curtailment Demo* with a live
  threshold slider

### 3. Bar Bending Schedule (BBS) & Cost
- Auto-generated BBS table: bar mark, shape, dia, length, nos, weight
- Steel cost panel using live ₹/kg input
- Concrete, formwork & total project cost roll-up

### 4. Health Monitoring (Demo)
- Dashboard with health score, vibration (mm/s), status badges
- Animated `SensorWave` chart for live-feel vibration
- Realistic demo alerts (beam deflection > L/250, column corrosion,
  footing settlement > 25 mm) and 4-month trend analytics

### 5. Other Modules
- Market prices, suppliers, drainage design, project scheduling,
  calculators, scan history, reports & exports

---

## 🧱 Tech Stack

| Layer | Choice |
|------|--------|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS v3 + shadcn/ui (semantic HSL tokens) |
| 3D | @react-three/fiber, @react-three/drei, three |
| Charts | recharts |
| Animation | framer-motion |
| State / data | @tanstack/react-query |
| Backend | Lovable Cloud (Supabase: Postgres + Auth + Storage + Edge Functions) |
| Routing | react-router-dom |
| Forms | react-hook-form + zod |

---

## 📁 Project Structure

```
src/
├── assets/
│   └── icons/                ← drop custom app icons here
├── components/
│   ├── BottomNav.tsx
│   ├── HealthScore.tsx
│   ├── SensorWave.tsx
│   ├── StatusBadge.tsx
│   ├── design/
│   │   ├── DesignInputForm.tsx
│   │   ├── DesignResults.tsx
│   │   ├── Drawing2D.tsx
│   │   ├── Structural3DViewer.tsx  ← CurtailedBar lives here
│   │   ├── BarSchedule.tsx
│   │   ├── SteelCostPanel.tsx
│   │   ├── ComplianceChecker.tsx
│   │   └── ExportTools.tsx
│   ├── drainage/  scheduling/  ui/ (shadcn)
│   └── views/                ← one file per bottom-nav tab
├── lib/
│   └── structural-calculations.ts  ← all IS 456 math
├── integrations/supabase/    ← auto-generated, do not edit
├── pages/   hooks/   test/
└── index.css                 ← design tokens (HSL)
```

---

## 🚀 Getting Started

```bash
bun install         # or npm install
bun run dev         # vite dev server
bun run build
```

Environment variables (auto-provisioned by Lovable Cloud, do not edit):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

---

## 🎨 Design System

- All colors live in `src/index.css` as HSL CSS variables and are
  exposed through `tailwind.config.ts`.
- Components **never** use raw classes like `bg-white` / `text-black`;
  always use semantic tokens (`bg-background`, `text-foreground`,
  `bg-primary`, …).
- Mobile-first, bottom-tab navigation, soft elevation, generous
  spacing — feels like a native app.

---

## 📐 Engineering Accuracy Rules

The app must always:
1. Use exact IS 456:2000 formulas — no approximations.
2. Look up τc from Table 19 (never assume a value).
3. Compute stirrup spacing from `Vs` (never default to 150 mm).
4. Produce sample target for verification:
   `b = 230, D = 450, d = 415, fck = 20, fy = 415, Mu = 50 kN·m`
   → `Ast ≈ 377 mm²`.
5. Use **curtailed bars only** (bent-up / cranked bars are removed
   everywhere — calc, BBS, 2D, 3D).

---

## 🤖 Rebuild With AI

A complete prompt that lets any capable AI agent regenerate this
project from scratch is provided in [`MASTER_PROMPT.md`](./MASTER_PROMPT.md).

---

## 📄 License

Educational / internal use. IS 456:2000 belongs to the Bureau of Indian Standards.
