# MASTER PROMPT — Rebuild “Structura” From Scratch

Paste the prompt below into any capable code-generation AI (Lovable, Cursor, Claude Code, GPT-Engineer, etc.) to reproduce this project end-to-end. The prompt is self-contained: stack, modules, formulas, design system, file layout, acceptance tests.

---

## 🟦 SYSTEM / ROLE

You are a senior full-stack engineer + structural engineer. Build a mobile-first PWA called **Structura** — a smart structural design & cost-estimation app for the Indian construction market. Follow IS 456:2000 strictly. Ship production-quality TypeScript, accessible UI, and accurate engineering math. Ask only if a requirement is ambiguous; otherwise implement.

---

## 🟦 TECH STACK (NON-NEGOTIABLE)

- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS v3 + shadcn/ui
- react-router-dom, @tanstack/react-query, react-hook-form + zod
- framer-motion for animation
- recharts for charts
- three + @react-three/fiber + @react-three/drei for 3D
- Backend: Supabase (Postgres + Auth + Storage + Edge Functions). Roles in a SEPARATE `user_roles` table with a `has_role()` SECURITY DEFINER function. Every public table needs `GRANT` + RLS + policies.
- Bun or npm package manager
- No Next.js, no Vue, no Angular

---

## 🟦 INFORMATION ARCHITECTURE

Bottom tab navigation (mobile-first) with these views:

1. **Home** — health score, vibration mm/s, status badge, animated `SensorWave`, recent scans, quick actions.
2. **Design (IS 456)** — input form → results → tabs: *Inputs · Results · 2D Drawing · 3D View · Bar Schedule · Cost · Compliance · Export*.
3. **Scan** — capture / upload structure photos, store via Lovable Cloud Storage.
4. **Calculators** — quick utilities (load, slab thickness, dev length…).
5. **Market Prices** — live ₹ per unit for steel, cement, aggregate, etc.
6. **Suppliers**, **Cost Estimator**, **Scheduling (Gantt-ish)**, **Drainage**, **Reports**, **Settings**.

---

## 🟦 IS 456:2000 STRUCTURAL ENGINE  (`src/lib/structural-calculations.ts`)

Implement pure, unit-tested functions. Required math:

### Singly Reinforced Rectangular Beam

```
Ast = (0.5 · fck · b · d / fy) · [ 1 − √( 1 − (4.6 · Mu) / (fck · b · d²) ) ]
```

- Evaluate the discriminant carefully; if `4.6·Mu/(fck·b·d²) > 1` flag “section under-sized, increase d or use doubly reinforced”.
- Mu in N·mm, b & d in mm, fck & fy in N/mm².
- Compute `pt%`, `Ast_min = 0.85·b·d/fy`, `Ast_max = 0.04·b·D`.

### Shear

- `τv = Vu / (b·d)`
- `τc` from **IS 456 Table 19** (function of `pt%` and `fck`). Implement as a 2D lookup table with bilinear interpolation. **Never assume τc.**
- `τc,max` from Table 20.
- If `τv > τc`: `Vus = Vu − τc·b·d`, stirrups spacing `Sv = (0.87·fy·Asv·d) / Vus`.
- Spacing checks: `≤ 0.75·d`, `≤ 300 mm`, `≤ (0.87·fy·Asv)/(0.4·b)`.

### Detailing — CURTAILED BARS ONLY

- Remove every trace of bent-up / cranked bars (calc, BBS, 2D, 3D).
- Curtail bars per IS 456 clause 26.2.3 (extend by `12·Ø` or `d`, whichever greater, past the theoretical cut-off).
- Typical curtailment at 0.6 × span for simply supported beams; reflect this everywhere.

### Other Members

- Columns (axial + uniaxial bending), slabs (one-way & two-way coefficients), isolated footings (one-way & punching shear).

### Verification Test

Inputs: `b=230, D=450, d=415, fck=20, fy=415, Mu=50 kN·m`
Must yield `Ast ≈ 377 mm²`. Add a vitest spec for this.

---

## 🟦 3D VIEWPORT  (`src/components/design/Structural3DViewer.tsx`)

Structure:

```tsx
<Canvas camera={{ position: [6, 6, 8], fov: 50 }}>
  <ambientLight intensity={0.6} />
  <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
  <Environment preset="city" />
  <OrbitControls enableDamping makeDefault />
  {/* ground plane */}
  {/* mapped <CurtailedBar /> rows */}
</Canvas>
```

### `CurtailedBar` child

Props: `{ value:number; threshold:number; position:[number,number,number]; color:string }`

```ts
const actualHeight    = Math.min(value, threshold);
const curtailedAmount = Math.max(0, value - threshold);
```

- Main mesh: `<boxGeometry args={[1, actualHeight, 1]} />`, anchored to floor at `y = position[1] + actualHeight/2`.
- If `curtailedAmount > 0`, render a second semi-transparent **red** box of height `curtailedAmount` at `y = position[1] + actualHeight + curtailedAmount/2`.

### Demo scene

- Slider (outside `<Canvas>`) controls a global `curtailThreshold`.
- Map over sample `{ id, value, color }[]` to render a row of bars.
- Provide a tab toggle: *Structural View* (real beam reinforcement) vs *Curtailment Demo*.

---

## 🟦 BAR BENDING SCHEDULE & COST

- `BarSchedule.tsx`: table { Mark, Shape (SVG), Ø (mm), Length (mm), Nos, Total Length, Unit Wt, Total Wt }. Use `weight = (d²/162) · L_m`.
- `SteelCostPanel.tsx`: ₹/kg input → total steel cost. Add concrete (m³ × ₹/m³) and formwork rolls into grand total.

---

## 🟦 HEALTH MONITORING (DEMO DATA OK)

- Home: health score 82, vibration 2.1 mm/s, “12 structures OK”.
- Reports: 47 scans, 12 structures, 4-month trend (Jan–Apr).
- Alerts:
  - RCC Beam B-14 — deflection > L/250 (Warning)
  - Column C-7 — reinforcement corrosion (Critical)
  - Footing F-3 — settlement > 25 mm (Warning)
- `SensorWave` animated SVG/Canvas line representing vibration.

---

## 🟦 DESIGN SYSTEM

- Mobile-first, native-app feel, bottom tabs, large tap targets.
- All colors as HSL CSS variables in `src/index.css`, surfaced via `tailwind.config.ts`.
- Components MUST use semantic tokens only (`bg-background`, `text-foreground`, `bg-primary`, `bg-card`, `border-border`, …). No raw `bg-white` / `text-black`.
- Distinctive type pair (avoid Inter/Poppins clichés). Soft shadows, subtle gradients, generous spacing.
- Light + dark mode both pass contrast.

---

## 🟦 FILE LAYOUT (CREATE EXACTLY)

```
src/
  assets/icons/                 (empty, .gitkeep — user drops custom icon)
  components/
    BottomNav.tsx  NavLink.tsx  HealthScore.tsx  SensorWave.tsx
    StatusBadge.tsx  ScanHistory.tsx
    design/
      DesignInputForm.tsx  DesignResults.tsx  Drawing2D.tsx
      Structural3DViewer.tsx  BarSchedule.tsx  SteelCostPanel.tsx
      ComplianceChecker.tsx  ExportTools.tsx
    drainage/  scheduling/  ui/ (shadcn)
    views/
      HomeView.tsx  DesignView.tsx  ScanView.tsx  CalculatorsView.tsx
      MarketPriceView.tsx  SupplierView.tsx  CostEstimatorView.tsx
      SchedulingView.tsx  DrainageView.tsx  ReportsView.tsx  SettingsView.tsx
  lib/structural-calculations.ts
  pages/Index.tsx  pages/NotFound.tsx
  hooks/   integrations/supabase/   test/
  index.css   App.tsx   main.tsx
```

---

## 🟦 BACKEND (LOVABLE CLOUD / SUPABASE)

If auth/storage needed:

- `app_role` enum: `'admin' | 'engineer' | 'user'`
- `user_roles(user_id, role)` separate table + `has_role(uid, role)` SECURITY DEFINER
- Every public table: `GRANT` to `authenticated` + `service_role`, then `ENABLE ROW LEVEL SECURITY`, then policies.
- No anonymous sign-ups. Add Google OAuth.

---

## 🟦 ACCEPTANCE CRITERIA

1. `bun run build` succeeds with zero TS errors.
2. Beam verification test passes: `Ast ≈ 377 mm²` for the inputs above.
3. τc is looked up from Table 19, never hard-coded.
4. Stirrup spacing is computed from `Vs`, never assumed.
5. No bent-up bar code anywhere (`rg -i "bent.?up|cranked"` returns nothing).
6. 3D viewer renders curtailed bars with the exact math above; slider updates the threshold live.
7. Bar Bending Schedule, 2D Drawing, 3D View, Cost, Compliance, Export tabs all functional.
8. Home + Reports show realistic demo monitoring data.
9. All colors come from semantic tokens; no raw color classes in component files.
10. Mobile-first layout looks great at 375 × 812.

---

## 🟦 DELIVERY

- Produce the full repo with the structure above.
- Include `README.md` and this `MASTER_PROMPT.md`.
- Provide at least one vitest spec covering the beam verification.
- End with a short run-book: `bun install && bun run dev`.

Build it.
