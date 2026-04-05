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

export const materials: Material[] = [
  // Raw Materials
  mat("m1", "River Sand", "Raw Materials", "ton", 1800),
  mat("m2", "M Sand", "Raw Materials", "ton", 1500),
  mat("m3", "Cement (OPC 53)", "Raw Materials", "bag", 380),
  mat("m4", "Cement (PPC)", "Raw Materials", "bag", 350),
  mat("m5", "Steel / TMT Bars (Fe500)", "Raw Materials", "kg", 65),
  mat("m6", "Fly Ash", "Raw Materials", "ton", 800),
  mat("m7", "Lime", "Raw Materials", "bag", 220),
  mat("m8", "Gravel", "Raw Materials", "ton", 1200),
  mat("m9", "Aggregates 10mm", "Raw Materials", "ton", 1400),
  mat("m10", "Aggregates 20mm", "Raw Materials", "ton", 1350),
  mat("m11", "Aggregates 40mm", "Raw Materials", "ton", 1300),

  // Structural Materials
  mat("m12", "Ready Mix Concrete (M20)", "Structural Materials", "m³", 4800),
  mat("m13", "Red Bricks", "Structural Materials", "piece", 8),
  mat("m14", "Concrete Blocks (6\")", "Structural Materials", "piece", 42),
  mat("m15", "AAC Blocks", "Structural Materials", "piece", 55),
  mat("m16", "Shuttering Plywood", "Structural Materials", "sq ft", 65),
  mat("m17", "Binding Wire", "Structural Materials", "kg", 72),
  mat("m18", "Reinforcement Mesh", "Structural Materials", "kg", 75),

  // Flooring Materials
  mat("m19", "Vitrified Tiles (2x2)", "Flooring Materials", "sq ft", 45),
  mat("m20", "Ceramic Tiles", "Flooring Materials", "sq ft", 32),
  mat("m21", "Marble (Makrana)", "Flooring Materials", "sq ft", 120),
  mat("m22", "Granite (Black)", "Flooring Materials", "sq ft", 95),
  mat("m23", "Kota Stone", "Flooring Materials", "sq ft", 28),

  // Finishing Materials
  mat("m24", "Wall Putty", "Finishing Materials", "bag", 750),
  mat("m25", "Emulsion Paint", "Finishing Materials", "litre", 320),
  mat("m26", "Primer", "Finishing Materials", "litre", 180),
  mat("m27", "Waterproofing Chemical", "Finishing Materials", "litre", 450),
  mat("m28", "Plaster of Paris", "Finishing Materials", "bag", 280),
  mat("m29", "POP", "Finishing Materials", "bag", 320),

  // Electrical Materials
  mat("m30", "Electrical Wire (1.5mm)", "Electrical Materials", "m", 18),
  mat("m31", "Modular Switch", "Electrical Materials", "piece", 85),
  mat("m32", "Switchboard (8-way)", "Electrical Materials", "piece", 450),
  mat("m33", "MCB (32A)", "Electrical Materials", "piece", 320),
  mat("m34", "Distribution Box", "Electrical Materials", "piece", 1800),
  mat("m35", "LED Light (12W)", "Electrical Materials", "piece", 180),
  mat("m36", "PVC Conduit (25mm)", "Electrical Materials", "m", 22),

  // Plumbing Materials
  mat("m37", "PVC Pipe (4\")", "Plumbing Materials", "m", 120),
  mat("m38", "CPVC Pipe (1\")", "Plumbing Materials", "m", 85),
  mat("m39", "GI Pipe (1\")", "Plumbing Materials", "m", 180),
  mat("m40", "Pipe Fittings (Elbow)", "Plumbing Materials", "piece", 25),
  mat("m41", "Water Tank (1000L)", "Plumbing Materials", "piece", 6500),
  mat("m42", "Ball Valve (1\")", "Plumbing Materials", "piece", 280),
  mat("m43", "Water Pump (1HP)", "Plumbing Materials", "piece", 4500),

  // Wood & Carpentry
  mat("m44", "Plywood (18mm)", "Wood & Carpentry", "sq ft", 85),
  mat("m45", "MDF Board", "Wood & Carpentry", "sq ft", 42),
  mat("m46", "Laminate Sheet", "Wood & Carpentry", "sq ft", 35),
  mat("m47", "Veneer Sheet", "Wood & Carpentry", "sq ft", 55),
  mat("m48", "Wooden Door (Teak)", "Wood & Carpentry", "piece", 18000),
  mat("m49", "Aluminium Window", "Wood & Carpentry", "sq ft", 350),

  // Roofing Materials
  mat("m50", "GI Roofing Sheet", "Roofing Materials", "sq ft", 32),
  mat("m51", "Clay Roof Tile", "Roofing Materials", "piece", 18),
  mat("m52", "Waterproof Sheet", "Roofing Materials", "sq ft", 15),
  mat("m53", "Insulation Sheet", "Roofing Materials", "sq ft", 28),

  // Labour Costs
  mat("m54", "Mason", "Labour Costs", "day", 800),
  mat("m55", "Helper", "Labour Costs", "day", 500),
  mat("m56", "Carpenter", "Labour Costs", "day", 850),
  mat("m57", "Electrician", "Labour Costs", "day", 750),
  mat("m58", "Plumber", "Labour Costs", "day", 750),
  mat("m59", "Painter", "Labour Costs", "day", 700),
  mat("m60", "Tile Installer", "Labour Costs", "day", 800),
  mat("m61", "Bar Bender", "Labour Costs", "day", 900),
  mat("m62", "Machine Operator", "Labour Costs", "day", 1000),
];

export const suppliers: Supplier[] = [
  {
    id: "s1", companyName: "BuildMart India", contactPerson: "Rajesh Kumar", phone: "+91 98765 43210",
    email: "info@buildmart.in", city: "Mumbai", deliveryArea: ["Mumbai", "Pune", "Nashik"],
    materials: ["Cement", "Steel", "Sand", "Aggregates"], rating: 4.5, reviews: 234, verified: true,
  },
  {
    id: "s2", companyName: "Nirmaan Supplies", contactPerson: "Suresh Patel", phone: "+91 87654 32109",
    email: "sales@nirmaan.co", city: "Ahmedabad", deliveryArea: ["Ahmedabad", "Surat", "Vadodara"],
    materials: ["Bricks", "Blocks", "Tiles", "Plywood"], rating: 4.2, reviews: 156, verified: true,
  },
  {
    id: "s3", companyName: "SteelKing Traders", contactPerson: "Anand Sharma", phone: "+91 76543 21098",
    email: "anand@steelking.in", city: "Delhi", deliveryArea: ["Delhi", "Noida", "Gurgaon"],
    materials: ["Steel", "TMT Bars", "Binding Wire", "Mesh"], rating: 4.7, reviews: 312, verified: true,
  },
  {
    id: "s4", companyName: "SouthBuild Corp", contactPerson: "Karthik R", phone: "+91 65432 10987",
    email: "karthik@southbuild.in", city: "Chennai", deliveryArea: ["Chennai", "Coimbatore", "Madurai"],
    materials: ["M Sand", "Cement", "RMC", "Blocks"], rating: 4.3, reviews: 189, verified: true,
  },
  {
    id: "s5", companyName: "ElectroPro Solutions", contactPerson: "Vikram Singh", phone: "+91 54321 09876",
    email: "vikram@electropro.in", city: "Bangalore", deliveryArea: ["Bangalore", "Mysore"],
    materials: ["Wires", "Switches", "MCB", "LED Lights"], rating: 4.6, reviews: 98, verified: false,
  },
  {
    id: "s6", companyName: "PipeLine Masters", contactPerson: "Faraz Khan", phone: "+91 43210 98765",
    email: "faraz@pipeline.in", city: "Hyderabad", deliveryArea: ["Hyderabad", "Secunderabad"],
    materials: ["PVC Pipes", "CPVC Pipes", "Fittings", "Valves"], rating: 4.1, reviews: 67, verified: true,
  },
  {
    id: "s7", companyName: "WoodCraft Industries", contactPerson: "Mohan Das", phone: "+91 32109 87654",
    email: "mohan@woodcraft.in", city: "Kolkata", deliveryArea: ["Kolkata", "Howrah", "Durgapur"],
    materials: ["Plywood", "MDF", "Laminates", "Doors"], rating: 4.4, reviews: 145, verified: true,
  },
  {
    id: "s8", companyName: "TileWorld India", contactPerson: "Priya Mehta", phone: "+91 21098 76543",
    email: "priya@tileworld.in", city: "Pune", deliveryArea: ["Pune", "Mumbai", "Nashik"],
    materials: ["Vitrified Tiles", "Ceramic Tiles", "Marble", "Granite"], rating: 4.8, reviews: 278, verified: true,
  },
];

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
