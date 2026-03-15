// Construction Material Market Data Types & Mock Data

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  supplier: string;
  region: string;
  lastUpdated: string;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  deliveryArea: string[];
  materials: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  logo?: string;
}

export interface Region {
  id: string;
  city: string;
  state: string;
}

export type MaterialCategory =
  | "Raw Materials"
  | "Structural Materials"
  | "Flooring Materials"
  | "Finishing Materials"
  | "Electrical Materials"
  | "Plumbing Materials"
  | "Wood & Carpentry"
  | "Roofing Materials"
  | "Labour Costs";

export const categories: MaterialCategory[] = [
  "Raw Materials",
  "Structural Materials",
  "Flooring Materials",
  "Finishing Materials",
  "Electrical Materials",
  "Plumbing Materials",
  "Wood & Carpentry",
  "Roofing Materials",
  "Labour Costs",
];

export const regions: Region[] = [
  { id: "r1", city: "Mumbai", state: "Maharashtra" },
  { id: "r2", city: "Bangalore", state: "Karnataka" },
  { id: "r3", city: "Delhi", state: "Delhi" },
  { id: "r4", city: "Chennai", state: "Tamil Nadu" },
  { id: "r5", city: "Hyderabad", state: "Telangana" },
  { id: "r6", city: "Pune", state: "Maharashtra" },
  { id: "r7", city: "Ahmedabad", state: "Gujarat" },
  { id: "r8", city: "Kolkata", state: "West Bengal" },
];

function generateHistory(basePrice: number, days = 30): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * 0.92;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price += (Math.random() - 0.45) * basePrice * 0.02;
    price = Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, price));
    history.push({ date: date.toISOString().split("T")[0], price: Math.round(price) });
  }
  return history;
}

function mat(id: string, name: string, category: MaterialCategory, unit: string, price: number, region = "Mumbai"): Material {
  const prev = price * (1 + (Math.random() - 0.5) * 0.08);
  const change = ((price - prev) / prev) * 100;
  return {
    id, name, category, unit,
    currentPrice: price,
    previousPrice: Math.round(prev),
    priceChange: +change.toFixed(2),
    supplier: ["UltraTech", "ACC", "Tata Steel", "JSW", "Ambuja", "Dalmia", "Shree Cement", "Birla"][Math.floor(Math.random() * 8)],
    region,
    lastUpdated: new Date().toISOString().split("T")[0],
    priceHistory: generateHistory(price),
  };
}

export const materials: Material[] = [];

export const suppliers: Supplier[] = [];

// Calculator utilities
export interface ConcreteResult {
  cement: number; sand: number; aggregate: number; water: number;
}

export function calculateConcreteMix(grade: string, volume: number): ConcreteResult {
  const ratios: Record<string, [number, number, number]> = {
    M5: [1, 5, 10], M10: [1, 3, 6], M15: [1, 2, 4], M20: [1, 1.5, 3], M25: [1, 1, 2],
  };
  const [c, s, a] = ratios[grade] || ratios.M20;
  const total = c + s + a;
  const dryVolume = volume * 1.54;
  const cementVol = (c / total) * dryVolume;
  const cementBags = cementVol / 0.035;
  return {
    cement: +cementBags.toFixed(1),
    sand: +((s / total) * dryVolume).toFixed(2),
    aggregate: +((a / total) * dryVolume).toFixed(2),
    water: +(cementBags * 25).toFixed(0),
  };
}

export interface BrickResult {
  bricks: number; mortar: number; cementBags: number;
}

export function calculateBricks(length: number, height: number, brickSize: "standard" | "modular"): BrickResult {
  const area = length * height;
  const bricksPerSqm = brickSize === "standard" ? 500 : 450;
  const bricks = Math.ceil(area * bricksPerSqm / 10.764); // convert to sq ft input
  const mortar = +(area * 0.03).toFixed(2);
  return { bricks, mortar, cementBags: Math.ceil(mortar / 0.035 * 0.2) };
}

export interface PlasterResult {
  cement: number; sand: number;
}

export function calculatePlaster(area: number, thickness: number): PlasterResult {
  const volume = area * (thickness / 1000);
  const dryVolume = volume * 1.3;
  const cement = +(dryVolume / 5 / 0.035).toFixed(1); // 1:4 ratio
  const sand = +(dryVolume * 4 / 5).toFixed(2);
  return { cement, sand };
}

export interface TileResult {
  tiles: number; wastage: number; totalTiles: number;
}

export function calculateTiles(floorArea: number, tileW: number, tileH: number, wastePct = 10): TileResult {
  const tileArea = (tileW * tileH) / 10000; // cm² to m²
  const tiles = Math.ceil(floorArea / tileArea);
  const wastage = Math.ceil(tiles * wastePct / 100);
  return { tiles, wastage, totalTiles: tiles + wastage };
}

// Cost Estimator
export interface CostEstimate {
  costPerSqFt: number;
  materialCost: number;
  labourCost: number;
  totalCost: number;
  breakdown: { item: string; cost: number; pct: number }[];
}

export function estimateProjectCost(
  builtUpArea: number,
  floors: number,
  quality: "basic" | "standard" | "premium",
  city: string
): CostEstimate {
  const baseRates: Record<string, number> = { basic: 1400, standard: 1900, premium: 2800 };
  const cityMultiplier: Record<string, number> = {
    Mumbai: 1.3, Delhi: 1.2, Bangalore: 1.15, Chennai: 1.1,
    Hyderabad: 1.05, Pune: 1.1, Ahmedabad: 1.0, Kolkata: 0.95,
  };
  const rate = baseRates[quality] * (cityMultiplier[city] || 1.0);
  const totalArea = builtUpArea * floors;
  const totalCost = totalArea * rate;
  const materialCost = totalCost * 0.6;
  const labourCost = totalCost * 0.25;

  const breakdown = [
    { item: "Structure (RCC)", cost: totalCost * 0.3, pct: 30 },
    { item: "Brickwork & Masonry", cost: totalCost * 0.1, pct: 10 },
    { item: "Flooring & Tiling", cost: totalCost * 0.1, pct: 10 },
    { item: "Electrical", cost: totalCost * 0.08, pct: 8 },
    { item: "Plumbing", cost: totalCost * 0.07, pct: 7 },
    { item: "Painting & Finishing", cost: totalCost * 0.08, pct: 8 },
    { item: "Doors & Windows", cost: totalCost * 0.07, pct: 7 },
    { item: "Labour", cost: labourCost, pct: 25 },
    { item: "Miscellaneous", cost: totalCost * 0.05, pct: 5 },
  ];

  return {
    costPerSqFt: Math.round(rate),
    materialCost: Math.round(materialCost),
    labourCost: Math.round(labourCost),
    totalCost: Math.round(totalCost),
    breakdown: breakdown.map(b => ({ ...b, cost: Math.round(b.cost) })),
  };
}
