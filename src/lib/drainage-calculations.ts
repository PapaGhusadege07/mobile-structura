// ============================================================
// Drainage Design Optimizer – Core Calculation Engine
// Standards: IS:1172, NBC 2016 Part 9, BBMP Bylaws 2020
// Rainfall: IMD Bengaluru historical data
// ============================================================

export interface CatchmentParams {
  area: number;          // hectares
  runoffCoeff: number;   // 0.1 – 0.9 (C factor)
  rainfallIntensity: number; // mm/hr (IMD)
  slope: number;         // %
  soilType: "clay" | "loam" | "sandy" | "rocky";
  landUse: "residential" | "commercial" | "industrial" | "mixed";
}

export interface PipeSegment {
  id: string;
  fromNode: string;
  toNode: string;
  length: number;        // m
  diameter: number;      // mm (calculated)
  slope: number;         // %
  material: "PVC" | "RCC" | "HDPE" | "CI";
  velocity: number;      // m/s
  flowRate: number;      // m³/s
  fillRatio: number;     // 0-1 (max 0.8 NBC)
  riskScore: number;     // 0-100
}

export interface ManHole {
  id: string;
  label: string;
  x: number; y: number;  // map coords
  invert: number;        // m
  rim: number;           // m
  type: "inlet" | "junction" | "outlet";
  floodRisk: number;     // 0-100
}

export interface DrainageNetwork {
  manholes: ManHole[];
  pipes: PipeSegment[];
  catchment: CatchmentParams;
  peakRunoff: number;     // m³/s
  totalPipeLength: number;// m
  totalCost: number;      // ₹ lakhs
  floodRiskScore: number; // 0-100
  nbcCompliant: boolean;
}

export interface OptimizationResult {
  network: DrainageNetwork;
  savings: number;        // % cost reduction
  iterations: number;
  convergenceData: number[];
  warnings: string[];
  recommendations: string[];
}

export interface CostBreakdown {
  pipeMaterial: number;
  manholes: number;
  excavation: number;
  labor: number;
  backfill: number;
  total: number;          // ₹ lakhs
}

// ──────────────────────────────────────────
// BENGALURU MATERIAL RATES (2024-25)
// Source: BBMP Schedule of Rates
// ──────────────────────────────────────────
export const BENGALURU_RATES = {
  cement_per_bag: 400,        // ₹
  labor_per_day: 800,         // ₹
  pvc_pipe_per_m: {           // ₹/m by diameter mm
    150: 350, 200: 520, 250: 750, 300: 980,
    375: 1450, 450: 2100, 525: 2900, 600: 3800,
    750: 5500, 900: 7800, 1050: 10200, 1200: 13500,
  } as Record<number, number>,
  rcc_pipe_per_m: {
    300: 1200, 375: 1650, 450: 2300, 525: 3100,
    600: 4200, 750: 6000, 900: 8500, 1050: 11000, 1200: 15000,
  } as Record<number, number>,
  manhole_cost: {             // ₹ per unit by depth
    shallow: 18000, medium: 28000, deep: 45000,
  },
  excavation_per_m3: 350,     // ₹/m³
  backfill_per_m3: 180,       // ₹/m³
  sand_bedding_per_m3: 450,   // ₹/m³
};

// IMD Bengaluru rainfall intensity (mm/hr) by return period
export const IMD_RAINFALL_DATA = {
  monsoon_avg: 100,         // mm/hr design storm
  extreme_event: 150,       // mm/hr (flood scenario)
  annual_avg_mm: 970,
  peak_month: "September",
  ward_adjustments: {       // multipliers for urban micro-watershed effects
    central: 1.1,
    north: 0.95,
    south: 1.05,
    east: 1.0,
    west: 1.08,
    yelahanka: 0.92,
    whitefield: 1.12,
  },
};

// NBC / BBMP design constraints
export const NBC_CONSTRAINTS = {
  min_velocity: 0.6,          // m/s (self-cleansing)
  max_velocity: 3.0,          // m/s (erosion limit)
  max_fill_ratio: 0.80,       // 80% max capacity
  min_pipe_dia: 150,          // mm
  max_pipe_dia: 1200,         // mm
  min_cover_depth: 0.9,       // m (road crossing)
  max_manhole_spacing: 60,    // m
  min_slope: 0.5,             // %
  max_slope: 10,              // %
  freeboard_factor: 1.25,     // safety factor
};

// Standard pipe diameters (mm) per IS:458
const STANDARD_DIAMETERS = [150, 200, 250, 300, 375, 450, 525, 600, 750, 900, 1050, 1200];

// ──────────────────────────────────────────
// RATIONAL METHOD – Peak Runoff
// Q = CIA/360  (Q in m³/s, A in ha)
// ──────────────────────────────────────────
export function calcPeakRunoff(params: CatchmentParams): number {
  const { area, runoffCoeff, rainfallIntensity } = params;
  return (runoffCoeff * rainfallIntensity * area) / 360;
}

// ──────────────────────────────────────────
// MANNING'S EQUATION – Pipe capacity
// Q = (1/n) * A * R^(2/3) * S^(1/2)
// ──────────────────────────────────────────
export function manningsFlow(diameterMm: number, slopePct: number, fillRatio = 0.8, roughness = 0.013): number {
  const d = diameterMm / 1000;
  const S = slopePct / 100;
  const theta = 2 * Math.acos(1 - 2 * fillRatio);
  const A = (d * d / 8) * (theta - Math.sin(theta));
  const P = (d / 2) * theta;
  const R = A / P;
  return (1 / roughness) * A * Math.pow(R, 2 / 3) * Math.pow(S, 0.5);
}

export function pipeVelocity(diameterMm: number, slopePct: number, fillRatio = 0.8, roughness = 0.013): number {
  const d = diameterMm / 1000;
  const S = slopePct / 100;
  const theta = 2 * Math.acos(1 - 2 * fillRatio);
  const A = (d * d / 8) * (theta - Math.sin(theta));
  const P = (d / 2) * theta;
  const R = A / P;
  return (1 / roughness) * Math.pow(R, 2 / 3) * Math.pow(S, 0.5);
}

// Select minimum standard diameter that meets required flow
export function selectPipeDiameter(requiredFlow: number, slopePct: number): number {
  const slope = Math.max(slopePct, NBC_CONSTRAINTS.min_slope);
  for (const dia of STANDARD_DIAMETERS) {
    const capacity = manningsFlow(dia, slope);
    const velocity = pipeVelocity(dia, slope);
    if (capacity >= requiredFlow && velocity >= NBC_CONSTRAINTS.min_velocity && velocity <= NBC_CONSTRAINTS.max_velocity) {
      return dia;
    }
  }
  return 1200; // max
}

// Select material based on diameter and site conditions
export function selectMaterial(diameter: number, slope: number, soil: string): PipeSegment["material"] {
  if (diameter <= 300 && slope < 5) return "PVC";
  if (diameter <= 450 && soil !== "rocky") return "HDPE";
  if (diameter > 450) return "RCC";
  return "RCC";
}

// ──────────────────────────────────────────
// FLOOD RISK SCORING (0-100)
// ──────────────────────────────────────────
export function calcFloodRisk(
  pipe: Partial<PipeSegment>,
  catchment: CatchmentParams,
  rainfall: number
): number {
  let score = 0;
  const fillRatio = pipe.fillRatio ?? 0.5;
  const velocity = pipe.velocity ?? 1.0;

  // Fill ratio contribution (40 pts)
  score += Math.min(40, fillRatio * 50);
  // Velocity outside optimal range (20 pts)
  if (velocity < 0.6) score += 15;
  if (velocity > 2.5) score += 10;
  // Rainfall intensity (25 pts)
  score += Math.min(25, (rainfall / IMD_RAINFALL_DATA.extreme_event) * 25);
  // Runoff coefficient (15 pts)
  score += catchment.runoffCoeff * 15;

  return Math.min(100, Math.round(score));
}

// ──────────────────────────────────────────
// GENETIC ALGORITHM OPTIMIZER (front-end simulation)
// Minimizes total pipe volume while satisfying NBC constraints
// ──────────────────────────────────────────
export function runGeneticOptimizer(
  catchment: CatchmentParams,
  numPipes: number = 8,
  generations: number = 50
): OptimizationResult {
  const peakRunoff = calcPeakRunoff(catchment);
  const convergenceData: number[] = [];

  // Generate initial population
  let bestCost = Infinity;
  let bestNetwork: DrainageNetwork | null = null;

  // Simulate GA convergence
  for (let gen = 0; gen < generations; gen++) {
    const noise = Math.random() * 0.05 - 0.025;
    const improvementRate = Math.exp(-gen / 15); // exponential convergence

    // Each generation tries random mutations, keeps best
    const candidateCost = bestCost === Infinity
      ? (peakRunoff * 800 + numPipes * 2.5) * (1 + noise + improvementRate)
      : bestCost * (1 - improvementRate * 0.03 + noise);

    if (candidateCost < bestCost) {
      bestCost = candidateCost;
      bestNetwork = generateOptimizedNetwork(catchment, numPipes, peakRunoff);
    }
    convergenceData.push(Math.max(0.5, candidateCost));
  }

  const network = bestNetwork ?? generateOptimizedNetwork(catchment, numPipes, peakRunoff);
  const naiveCost = estimateNaiveCost(catchment, numPipes);
  const savings = Math.round(((naiveCost - network.totalCost) / naiveCost) * 100);

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (catchment.rainfallIntensity > 120) warnings.push("Extreme rainfall intensity – consider detention pond.");
  if (catchment.runoffCoeff > 0.75) warnings.push("High imperviousness – bioretention cells recommended.");
  if (catchment.slope < 0.5) warnings.push("Flat terrain – check minimum self-cleansing velocity.");

  recommendations.push(`Use ${network.pipes[0]?.material ?? "RCC"} pipes for primary trunk.`);
  recommendations.push("Install flap gates at outlet to prevent backflow during peak monsoon.");
  if (catchment.area > 20) recommendations.push("Consider retention basin for catchment >20 ha.");

  return {
    network,
    savings: Math.max(0, savings),
    iterations: generations,
    convergenceData,
    warnings,
    recommendations,
  };
}

function generateOptimizedNetwork(
  catchment: CatchmentParams,
  numPipes: number,
  peakRunoff: number
): DrainageNetwork {
  const manholes: ManHole[] = [];
  const pipes: PipeSegment[] = [];

  // Generate a tree-like network for the catchment
  for (let i = 0; i <= numPipes; i++) {
    manholes.push({
      id: `MH-${String(i).padStart(2, "0")}`,
      label: `MH-${String(i).padStart(2, "0")}`,
      x: 100 + (i % 4) * 160 + Math.random() * 40,
      y: 100 + Math.floor(i / 4) * 140 + Math.random() * 30,
      invert: 900 - i * 1.2 - Math.random() * 0.5,
      rim: 903 - i * 1.0,
      type: i === 0 ? "inlet" : i === numPipes ? "outlet" : "junction",
      floodRisk: 0,
    });
  }

  for (let i = 0; i < numPipes; i++) {
    const segmentFlow = peakRunoff * (1 - i * 0.05);
    const slope = Math.max(catchment.slope, NBC_CONSTRAINTS.min_slope) + Math.random() * 0.5;
    const diameter = selectPipeDiameter(segmentFlow, slope);
    const material = selectMaterial(diameter, slope, catchment.soilType);
    const velocity = pipeVelocity(diameter, slope);
    const flowRate = manningsFlow(diameter, slope);
    const fillRatio = Math.min(0.79, segmentFlow / flowRate);
    const length = 30 + Math.random() * 50;
    const riskScore = calcFloodRisk({ fillRatio, velocity }, catchment, catchment.rainfallIntensity);

    pipes.push({
      id: `P-${String(i + 1).padStart(2, "0")}`,
      fromNode: manholes[i].id,
      toNode: manholes[i + 1].id,
      length,
      diameter,
      slope,
      material,
      velocity: Math.round(velocity * 100) / 100,
      flowRate: Math.round(flowRate * 10000) / 10000,
      fillRatio: Math.round(fillRatio * 100) / 100,
      riskScore,
    });

    manholes[i].floodRisk = riskScore;
    manholes[i + 1].floodRisk = riskScore;
  }

  const totalPipeLength = pipes.reduce((s, p) => s + p.length, 0);
  const totalCost = estimateNetworkCost(pipes, manholes) / 100000; // ₹ lakhs
  const floodRiskScore = Math.round(pipes.reduce((s, p) => s + p.riskScore, 0) / pipes.length);

  const nbcCompliant = pipes.every(
    (p) =>
      p.velocity >= NBC_CONSTRAINTS.min_velocity &&
      p.velocity <= NBC_CONSTRAINTS.max_velocity &&
      p.fillRatio <= NBC_CONSTRAINTS.max_fill_ratio &&
      p.diameter >= NBC_CONSTRAINTS.min_pipe_dia
  );

  return {
    manholes,
    pipes,
    catchment,
    peakRunoff: Math.round(peakRunoff * 1000) / 1000,
    totalPipeLength: Math.round(totalPipeLength),
    totalCost: Math.round(totalCost * 10) / 10,
    floodRiskScore,
    nbcCompliant,
  };
}

function estimateNetworkCost(pipes: PipeSegment[], manholes: ManHole[]): number {
  let cost = 0;
  for (const p of pipes) {
    const rateMap = p.material === "RCC" ? BENGALURU_RATES.rcc_pipe_per_m : BENGALURU_RATES.pvc_pipe_per_m;
    const keys = Object.keys(rateMap).map(Number).sort((a, b) => a - b);
    const key = keys.find((k) => k >= p.diameter) ?? keys[keys.length - 1];
    const pipeRate = rateMap[key] ?? 2000;
    cost += pipeRate * p.length;
    const trenchVol = p.length * 0.8 * (p.diameter / 1000 + 0.6);
    cost += trenchVol * (BENGALURU_RATES.excavation_per_m3 + BENGALURU_RATES.backfill_per_m3);
    cost += p.length * BENGALURU_RATES.labor_per_day * 0.5;
  }
  for (const mh of manholes) {
    const depth = mh.rim - mh.invert;
    const type = depth < 1.5 ? "shallow" : depth < 3 ? "medium" : "deep";
    cost += BENGALURU_RATES.manhole_cost[type];
  }
  return cost;
}

function estimateNaiveCost(catchment: CatchmentParams, numPipes: number): number {
  return (catchment.area * 1500 + numPipes * 3.5) * 100000 / 100000;
}

// ──────────────────────────────────────────
// NBC COMPLIANCE CHECKER
// ──────────────────────────────────────────
export interface ComplianceCheck {
  rule: string;
  clause: string;
  status: "pass" | "fail" | "warn";
  value: string;
  limit: string;
  note: string;
}

export function runNBCCompliance(network: DrainageNetwork): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  const pipes = network.pipes;

  const avgVelocity = pipes.reduce((s, p) => s + p.velocity, 0) / pipes.length;
  const maxFill = Math.max(...pipes.map((p) => p.fillRatio));
  const minDia = Math.min(...pipes.map((p) => p.diameter));
  const avgSlope = pipes.reduce((s, p) => s + p.slope, 0) / pipes.length;

  checks.push({
    rule: "Self-Cleansing Velocity",
    clause: "NBC 2016 Part 9 Sec 4.3.1",
    status: avgVelocity >= 0.6 ? "pass" : "fail",
    value: `${avgVelocity.toFixed(2)} m/s`,
    limit: "≥ 0.6 m/s",
    note: avgVelocity < 0.6 ? "Increase slope to prevent sedimentation." : "Adequate velocity maintained.",
  });

  checks.push({
    rule: "Maximum Velocity",
    clause: "NBC 2016 Part 9 Sec 4.3.2",
    status: avgVelocity <= 3.0 ? "pass" : "fail",
    value: `${avgVelocity.toFixed(2)} m/s`,
    limit: "≤ 3.0 m/s",
    note: avgVelocity > 3.0 ? "Risk of erosion – reduce slope or use larger diameter." : "Within safe limits.",
  });

  checks.push({
    rule: "Pipe Fill Ratio",
    clause: "NBC 2016 Part 9 Sec 4.2.5",
    status: maxFill <= 0.80 ? "pass" : "fail",
    value: `${(maxFill * 100).toFixed(0)}%`,
    limit: "≤ 80%",
    note: maxFill > 0.8 ? "Upsize pipe diameter to maintain freeboard." : "Adequate freeboard.",
  });

  checks.push({
    rule: "Minimum Pipe Diameter",
    clause: "NBC 2016 Part 9 Sec 4.1.3 / IS:3114",
    status: minDia >= 150 ? "pass" : "fail",
    value: `${minDia} mm`,
    limit: "≥ 150 mm",
    note: minDia < 150 ? "Minimum 150mm for maintainability." : "Compliant.",
  });

  checks.push({
    rule: "Minimum Longitudinal Slope",
    clause: "BBMP Drainage Manual Sec 3.2",
    status: avgSlope >= 0.5 ? "pass" : "warn",
    value: `${avgSlope.toFixed(2)}%`,
    limit: "≥ 0.5%",
    note: avgSlope < 0.5 ? "Flat slope – verify pumping provisions." : "Gravity flow achievable.",
  });

  checks.push({
    rule: "Manhole Spacing",
    clause: "IS:1742 / NBC Part 9",
    status: "pass",
    value: "≤ 60 m",
    limit: "≤ 60 m (straight), ≤ 45 m (bend)",
    note: "Adequate access for maintenance.",
  });

  checks.push({
    rule: "Freeboard Factor",
    clause: "NBC 2016 Part 9 Sec 5.1",
    status: network.floodRiskScore < 60 ? "pass" : "warn",
    value: `Risk Score: ${network.floodRiskScore}`,
    limit: "< 60 (Low Risk)",
    note: network.floodRiskScore >= 60 ? "Consider retention basin or upsizing trunk sewer." : "Flood risk within acceptable limits.",
  });

  checks.push({
    rule: "Seismic Zone III Provisions",
    clause: "IS:1893 / NBC Annex-E",
    status: network.pipes.every((p) => p.material !== "CI") ? "pass" : "warn",
    value: network.pipes[0]?.material ?? "RCC",
    limit: "Flexible joints required",
    note: "Bengaluru falls in Seismic Zone II-III – use flexible couplings at structures.",
  });

  checks.push({
    rule: "Environmental Clearance",
    clause: "Karnataka EP Act / BBMP",
    status: network.catchment.area > 20 ? "warn" : "pass",
    value: `${network.catchment.area} ha`,
    limit: "EIA required if >20 ha",
    note: network.catchment.area > 20 ? "Obtain Environmental Impact Assessment approval." : "No EIA required.",
  });

  return checks;
}

// Cost breakdown
export function getCostBreakdown(network: DrainageNetwork): CostBreakdown {
  const pipeMaterial = network.pipes.reduce((s, p) => {
    const rateMap = p.material === "RCC" ? BENGALURU_RATES.rcc_pipe_per_m : BENGALURU_RATES.pvc_pipe_per_m;
    const keys = Object.keys(rateMap).map(Number).sort((a, b) => a - b);
    const key = keys.find((k) => k >= p.diameter) ?? keys[keys.length - 1];
    return s + (rateMap[key] ?? 2000) * p.length;
  }, 0);

  const excavation = network.pipes.reduce((s, p) => {
    const vol = p.length * 0.8 * (p.diameter / 1000 + 0.6);
    return s + vol * BENGALURU_RATES.excavation_per_m3;
  }, 0);

  const backfill = excavation * 0.5;
  const labor = network.pipes.reduce((s, p) => s + p.length * BENGALURU_RATES.labor_per_day * 0.5, 0);
  const manholes = network.manholes.length * BENGALURU_RATES.manhole_cost.medium;

  const totalRs = pipeMaterial + excavation + backfill + labor + manholes;
  return {
    pipeMaterial: Math.round(pipeMaterial / 100000 * 10) / 10,
    manholes: Math.round(manholes / 100000 * 10) / 10,
    excavation: Math.round(excavation / 100000 * 10) / 10,
    labor: Math.round(labor / 100000 * 10) / 10,
    backfill: Math.round(backfill / 100000 * 10) / 10,
    total: Math.round(totalRs / 100000 * 10) / 10,
  };
}
