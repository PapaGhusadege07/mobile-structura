// Construction Material Market Data – India (Belgaum / Bangalore focus)

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

export interface PricePoint { date: string; price: number; }

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
}

export interface Region { id: string; city: string; state: string; }

export type MaterialCategory =
  | "Raw Materials" | "Structural Materials" | "Flooring Materials"
  | "Finishing Materials" | "Electrical Materials" | "Plumbing Materials"
  | "Wood & Carpentry" | "Roofing Materials" | "Labour Costs";

export const categories: MaterialCategory[] = [
  "Raw Materials", "Structural Materials", "Flooring Materials",
  "Finishing Materials", "Electrical Materials", "Plumbing Materials",
  "Wood & Carpentry", "Roofing Materials", "Labour Costs",
];

export const regions: Region[] = [
  { id: "r1", city: "Belgaum", state: "Karnataka" },
  { id: "r2", city: "Bangalore", state: "Karnataka" },
  { id: "r3", city: "Mumbai", state: "Maharashtra" },
  { id: "r4", city: "Pune", state: "Maharashtra" },
  { id: "r5", city: "Hyderabad", state: "Telangana" },
  { id: "r6", city: "Chennai", state: "Tamil Nadu" },
];

function generateHistory(basePrice: number, days = 30): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * 0.95;
  for (let i = days; i >= 0; i--) {
    const date = new Date(); date.setDate(date.getDate() - i);
    price += (Math.random() - 0.45) * basePrice * 0.015;
    price = Math.max(basePrice * 0.85, Math.min(basePrice * 1.15, price));
    history.push({ date: date.toISOString().split("T")[0], price: Math.round(price) });
  }
  return history;
}

function mat(id: string, name: string, category: MaterialCategory, unit: string, price: number, region: string, supplier: string): Material {
  const prev = price * (1 + (Math.random() - 0.5) * 0.06);
  return {
    id, name, category, unit, currentPrice: price,
    previousPrice: Math.round(prev),
    priceChange: +(((price - prev) / prev) * 100).toFixed(2),
    supplier, region,
    lastUpdated: new Date().toISOString().split("T")[0],
    priceHistory: generateHistory(price),
  };
}

// India (Belgaum & Bangalore focused) material prices in ₹
export const materials: Material[] = [
  // Raw Materials
  mat("m1", "River Sand", "Raw Materials", "ton", 2800, "Belgaum", "KK Sand Suppliers"),
  mat("m2", "M Sand", "Raw Materials", "ton", 1800, "Belgaum", "Belagavi Crushers"),
  mat("m3", "Cement OPC 53 (UltraTech)", "Raw Materials", "bag", 420, "Belgaum", "UltraTech"),
  mat("m4", "Cement PPC (ACC)", "Raw Materials", "bag", 395, "Belgaum", "ACC Cement"),
  mat("m5", "TMT Steel Fe500 (Tata Tiscon)", "Raw Materials", "kg", 72, "Belgaum", "Tata Steel"),
  mat("m6", "TMT Steel Fe500D (JSW)", "Raw Materials", "kg", 70, "Bangalore", "JSW Steel"),
  mat("m7", "Fly Ash", "Raw Materials", "ton", 1200, "Belgaum", "Local Supplier"),
  mat("m8", "Lime", "Raw Materials", "bag", 180, "Belgaum", "Dalmia"),
  mat("m9", "Gravel 20mm", "Raw Materials", "ton", 1600, "Belgaum", "Belagavi Crushers"),
  mat("m10", "Aggregate 10mm", "Raw Materials", "ton", 1800, "Bangalore", "Bangalore Aggregates"),
  mat("m11", "Aggregate 20mm", "Raw Materials", "ton", 1650, "Bangalore", "Bangalore Aggregates"),
  mat("m12", "Aggregate 40mm", "Raw Materials", "ton", 1500, "Belgaum", "Belagavi Crushers"),

  // Structural Materials
  mat("m13", "RMC M20", "Structural Materials", "m³", 5500, "Belgaum", "Ultratech RMC"),
  mat("m14", "RMC M25", "Structural Materials", "m³", 6000, "Bangalore", "ACC RMC"),
  mat("m15", "Red Bricks (Standard)", "Structural Materials", "1000 pcs", 8500, "Belgaum", "Belgaum Bricks"),
  mat("m16", "Concrete Blocks 6\"", "Structural Materials", "piece", 42, "Belgaum", "Local Blocks"),
  mat("m17", "AAC Blocks 6\"", "Structural Materials", "piece", 55, "Bangalore", "Aerocon"),
  mat("m18", "Shuttering Plywood 18mm", "Structural Materials", "sq ft", 85, "Belgaum", "Greenply"),
  mat("m19", "Binding Wire", "Structural Materials", "kg", 72, "Belgaum", "Tata Wire"),
  mat("m20", "Reinforcement Mesh", "Structural Materials", "kg", 78, "Bangalore", "JSW Steel"),

  // Flooring
  mat("m21", "Vitrified Tiles 600x600", "Flooring Materials", "sq ft", 55, "Belgaum", "Kajaria"),
  mat("m22", "Ceramic Tiles 300x300", "Flooring Materials", "sq ft", 35, "Belgaum", "Somany"),
  mat("m23", "Marble (Rajnagar)", "Flooring Materials", "sq ft", 120, "Bangalore", "Rajasthan Marble"),
  mat("m24", "Granite (Black)", "Flooring Materials", "sq ft", 95, "Bangalore", "Karnataka Granite"),
  mat("m25", "Kota Stone", "Flooring Materials", "sq ft", 45, "Belgaum", "Kota Supplier"),

  // Finishing
  mat("m26", "Wall Putty (Birla)", "Finishing Materials", "bag", 850, "Belgaum", "Birla White"),
  mat("m27", "Exterior Paint (Asian)", "Finishing Materials", "litre", 320, "Belgaum", "Asian Paints"),
  mat("m28", "Interior Paint (Asian)", "Finishing Materials", "litre", 280, "Bangalore", "Asian Paints"),
  mat("m29", "Primer", "Finishing Materials", "litre", 180, "Belgaum", "Asian Paints"),
  mat("m30", "Waterproofing (Dr. Fixit)", "Finishing Materials", "kg", 120, "Bangalore", "Pidilite"),
  mat("m31", "Plaster of Paris", "Finishing Materials", "bag", 350, "Belgaum", "Local Supplier"),

  // Electrical
  mat("m32", "Electrical Wire 1.5mm (Havells)", "Electrical Materials", "m", 18, "Belgaum", "Havells"),
  mat("m33", "Electrical Wire 2.5mm (Polycab)", "Electrical Materials", "m", 28, "Bangalore", "Polycab"),
  mat("m34", "Modular Switch (Legrand)", "Electrical Materials", "piece", 85, "Belgaum", "Legrand"),
  mat("m35", "MCB 32A (Schneider)", "Electrical Materials", "piece", 280, "Bangalore", "Schneider"),
  mat("m36", "LED Panel 18W", "Electrical Materials", "piece", 350, "Belgaum", "Philips"),
  mat("m37", "PVC Conduit 25mm", "Electrical Materials", "m", 22, "Belgaum", "Supreme"),

  // Plumbing
  mat("m38", "PVC Pipe 4\" (Supreme)", "Plumbing Materials", "m", 180, "Belgaum", "Supreme"),
  mat("m39", "CPVC Pipe 1\" (Astral)", "Plumbing Materials", "m", 95, "Bangalore", "Astral"),
  mat("m40", "GI Pipe 1\"", "Plumbing Materials", "m", 220, "Belgaum", "Tata Pipes"),
  mat("m41", "Water Tank 1000L (Sintex)", "Plumbing Materials", "piece", 8500, "Belgaum", "Sintex"),
  mat("m42", "Ball Valve 1\" (Zoloto)", "Plumbing Materials", "piece", 450, "Bangalore", "Zoloto"),

  // Wood & Carpentry
  mat("m43", "BWR Plywood 18mm", "Wood & Carpentry", "sq ft", 95, "Belgaum", "Greenply"),
  mat("m44", "MDF Board 18mm", "Wood & Carpentry", "sq ft", 55, "Bangalore", "Action Tesa"),
  mat("m45", "Laminate Sheet (Merino)", "Wood & Carpentry", "sq ft", 32, "Belgaum", "Merino"),
  mat("m46", "Teak Wood Door Frame", "Wood & Carpentry", "cft", 4500, "Belgaum", "Local Timber"),
  mat("m47", "Flush Door", "Wood & Carpentry", "piece", 3200, "Bangalore", "Greenply"),

  // Roofing
  mat("m48", "GI Roofing Sheet", "Roofing Materials", "sq ft", 38, "Belgaum", "Tata BlueScope"),
  mat("m49", "Mangalore Tiles", "Roofing Materials", "piece", 18, "Belgaum", "Belgaum Tiles"),
  mat("m50", "Waterproof Sheet", "Roofing Materials", "sq m", 85, "Bangalore", "Dr. Fixit"),

  // Labour Costs (per day rates in Belgaum/Bangalore)
  mat("m51", "Mason", "Labour Costs", "day", 900, "Belgaum", "—"),
  mat("m52", "Mason", "Labour Costs", "day", 1100, "Bangalore", "—"),
  mat("m53", "Helper", "Labour Costs", "day", 550, "Belgaum", "—"),
  mat("m54", "Helper", "Labour Costs", "day", 650, "Bangalore", "—"),
  mat("m55", "Carpenter", "Labour Costs", "day", 950, "Belgaum", "—"),
  mat("m56", "Electrician", "Labour Costs", "day", 850, "Belgaum", "—"),
  mat("m57", "Plumber", "Labour Costs", "day", 800, "Belgaum", "—"),
  mat("m58", "Painter", "Labour Costs", "day", 750, "Belgaum", "—"),
  mat("m59", "Tile Installer", "Labour Costs", "day", 850, "Bangalore", "—"),
  mat("m60", "Bar Bender", "Labour Costs", "day", 900, "Belgaum", "—"),
  mat("m61", "Machine Operator", "Labour Costs", "day", 1200, "Bangalore", "—"),
];

export const suppliers: Supplier[] = [
  {
    id: "s1", companyName: "Belagavi Building Materials", contactPerson: "Rajesh Patil",
    phone: "+91-9876543210", email: "rajesh@bbm.in", city: "Belgaum",
    deliveryArea: ["Belgaum", "Gokak", "Athani", "Chikkodi"],
    materials: ["Cement", "Sand", "Steel", "Bricks", "Aggregates"],
    rating: 4.6, reviews: 128, verified: true,
  },
  {
    id: "s2", companyName: "Karnataka Steel Traders", contactPerson: "Suresh Kumar",
    phone: "+91-9845612345", email: "suresh@kst.in", city: "Bangalore",
    deliveryArea: ["Bangalore", "Mysore", "Hubli"],
    materials: ["TMT Steel", "Binding Wire", "Reinforcement Mesh"],
    rating: 4.8, reviews: 256, verified: true,
  },
  {
    id: "s3", companyName: "Sri Lakshmi Cement Agency", contactPerson: "Mahesh Kulkarni",
    phone: "+91-9449876543", email: "mahesh@slca.in", city: "Belgaum",
    deliveryArea: ["Belgaum", "Dharwad", "Bagalkot"],
    materials: ["UltraTech Cement", "ACC Cement", "Ambuja Cement"],
    rating: 4.4, reviews: 92, verified: true,
  },
  {
    id: "s4", companyName: "Bangalore Hardware Hub", contactPerson: "Anil Reddy",
    phone: "+91-9900112233", email: "anil@bhh.in", city: "Bangalore",
    deliveryArea: ["Bangalore", "Electronic City", "Whitefield"],
    materials: ["Electrical", "Plumbing", "Paints", "Hardware"],
    rating: 4.3, reviews: 180, verified: true,
  },
  {
    id: "s5", companyName: "Deccan Tiles & Granite", contactPerson: "Priya Sharma",
    phone: "+91-9876001234", email: "priya@dtg.in", city: "Bangalore",
    deliveryArea: ["Bangalore", "Belgaum", "Hubli"],
    materials: ["Vitrified Tiles", "Marble", "Granite", "Kota Stone"],
    rating: 4.5, reviews: 145, verified: true,
  },
  {
    id: "s6", companyName: "Belgaum Timber Mart", contactPerson: "Vinod Joshi",
    phone: "+91-9448765432", email: "vinod@btm.in", city: "Belgaum",
    deliveryArea: ["Belgaum", "Goa"],
    materials: ["Plywood", "Teak Wood", "Doors", "Laminates"],
    rating: 4.2, reviews: 67, verified: false,
  },
];

// Calculator utilities
export interface ConcreteResult { cement: number; sand: number; aggregate: number; water: number; }

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

export interface BrickResult { bricks: number; mortar: number; cementBags: number; }

export function calculateBricks(length: number, height: number, brickSize: "standard" | "modular"): BrickResult {
  const area = length * height;
  const bricksPerSqm = brickSize === "standard" ? 500 : 450;
  const bricks = Math.ceil(area * bricksPerSqm / 10.764);
  const mortar = +(area * 0.03).toFixed(2);
  return { bricks, mortar, cementBags: Math.ceil(mortar / 0.035 * 0.2) };
}

export interface PlasterResult { cement: number; sand: number; }

export function calculatePlaster(area: number, thickness: number): PlasterResult {
  const volume = area * (thickness / 1000);
  const dryVolume = volume * 1.3;
  return { cement: +(dryVolume / 5 / 0.035).toFixed(1), sand: +(dryVolume * 4 / 5).toFixed(2) };
}

export interface TileResult { tiles: number; wastage: number; totalTiles: number; }

export function calculateTiles(floorArea: number, tileW: number, tileH: number, wastePct = 10): TileResult {
  const tileArea = (tileW * tileH) / 10000;
  const tiles = Math.ceil(floorArea / tileArea);
  const wastage = Math.ceil(tiles * wastePct / 100);
  return { tiles, wastage, totalTiles: tiles + wastage };
}

export interface CostEstimate {
  costPerSqFt: number; materialCost: number; labourCost: number;
  totalCost: number; breakdown: { item: string; cost: number; pct: number }[];
}

export function estimateProjectCost(
  builtUpArea: number, floors: number, quality: "basic" | "standard" | "premium", city: string
): CostEstimate {
  const baseRates: Record<string, number> = { basic: 1400, standard: 1900, premium: 2800 };
  const cityMultiplier: Record<string, number> = {
    Belgaum: 0.95, Bangalore: 1.15, Mumbai: 1.3, Pune: 1.1, Hyderabad: 1.05, Chennai: 1.1,
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
