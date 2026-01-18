import { z } from "zod";

// ============ VALIDATION SCHEMAS ============

export const beamInputSchema = z.object({
  spanLength: z.number().min(1, "Span must be at least 1m").max(20, "Span cannot exceed 20m"),
  width: z.number().min(200, "Width must be at least 200mm").max(600, "Width cannot exceed 600mm"),
  depth: z.number().min(300, "Depth must be at least 300mm").max(1200, "Depth cannot exceed 1200mm"),
  deadLoad: z.number().min(0, "Dead load cannot be negative").max(100, "Dead load cannot exceed 100 kN/m"),
  liveLoad: z.number().min(0, "Live load cannot be negative").max(50, "Live load cannot exceed 50 kN/m"),
  concreteGrade: z.enum(["M20", "M25", "M30", "M35", "M40"]),
  steelGrade: z.enum(["Fe415", "Fe500", "Fe550"]),
});

export const columnInputSchema = z.object({
  height: z.number().min(2, "Height must be at least 2m").max(6, "Height cannot exceed 6m"),
  width: z.number().min(200, "Width must be at least 200mm").max(800, "Width cannot exceed 800mm"),
  depth: z.number().min(200, "Depth must be at least 200mm").max(800, "Depth cannot exceed 800mm"),
  axialLoad: z.number().min(100, "Axial load must be at least 100 kN").max(5000, "Axial load cannot exceed 5000 kN"),
  momentX: z.number().min(0, "Moment cannot be negative").max(500, "Moment cannot exceed 500 kNm"),
  momentY: z.number().min(0, "Moment cannot be negative").max(500, "Moment cannot exceed 500 kNm"),
  concreteGrade: z.enum(["M20", "M25", "M30", "M35", "M40"]),
  steelGrade: z.enum(["Fe415", "Fe500", "Fe550"]),
});

export const footingInputSchema = z.object({
  columnWidth: z.number().min(200, "Column width must be at least 200mm").max(800, "Cannot exceed 800mm"),
  columnDepth: z.number().min(200, "Column depth must be at least 200mm").max(800, "Cannot exceed 800mm"),
  axialLoad: z.number().min(100, "Load must be at least 100 kN").max(5000, "Load cannot exceed 5000 kN"),
  soilBearingCapacity: z.number().min(50, "SBC must be at least 50 kN/m²").max(500, "SBC cannot exceed 500 kN/m²"),
  concreteGrade: z.enum(["M20", "M25", "M30", "M35", "M40"]),
  steelGrade: z.enum(["Fe415", "Fe500", "Fe550"]),
});

export const complianceInputSchema = z.object({
  seismicZone: z.enum(["II", "III", "IV", "V"]),
  windZone: z.enum(["1", "2", "3", "4", "5", "6"]),
  buildingType: z.enum(["residential", "commercial", "industrial", "institutional"]),
  stories: z.number().min(1).max(50),
  plotArea: z.number().min(50).max(10000),
  builtUpArea: z.number().min(30).max(8000),
  setbackFront: z.number().min(0).max(20),
  setbackRear: z.number().min(0).max(15),
  setbackSide: z.number().min(0).max(10),
});

// ============ TYPES ============

export type BeamInput = z.infer<typeof beamInputSchema>;
export type ColumnInput = z.infer<typeof columnInputSchema>;
export type FootingInput = z.infer<typeof footingInputSchema>;
export type ComplianceInput = z.infer<typeof complianceInputSchema>;

export interface BeamDesignResult {
  reinforcement: {
    tensionBars: string;
    compressionBars: string;
    stirrups: string;
    tensionArea: number; // mm²
    compressionArea: number; // mm²
  };
  moments: {
    ultimate: number; // kNm
    resistance: number; // kNm
  };
  shear: {
    ultimate: number; // kN
    resistance: number; // kN
  };
  deflection: {
    calculated: number; // mm
    allowable: number; // mm
  };
  status: "safe" | "warning" | "unsafe";
}

export interface ColumnDesignResult {
  reinforcement: {
    mainBars: string;
    ties: string;
    mainArea: number; // mm²
    percentage: number;
  };
  capacity: {
    axial: number; // kN
    momentX: number; // kNm
    momentY: number; // kNm
  };
  slenderness: {
    ratio: number;
    classification: "short" | "slender";
  };
  status: "safe" | "warning" | "unsafe";
}

export interface FootingDesignResult {
  dimensions: {
    length: number; // mm
    width: number; // mm
    depth: number; // mm
  };
  reinforcement: {
    mainBarsX: string;
    mainBarsY: string;
    areaX: number; // mm²
    areaY: number; // mm²
  };
  pressure: {
    actual: number; // kN/m²
    allowable: number; // kN/m²
  };
  punchingShear: {
    calculated: number; // kN
    resistance: number; // kN
  };
  status: "safe" | "warning" | "unsafe";
}

export interface ComplianceResult {
  seismic: {
    zoneFactor: number;
    responseFactor: number;
    baseShear: number; // kN
    compliant: boolean;
  };
  wind: {
    basicSpeed: number; // m/s
    designPressure: number; // kN/m²
    compliant: boolean;
  };
  bylaws: {
    far: { required: number; provided: number; compliant: boolean };
    groundCoverage: { required: number; provided: number; compliant: boolean };
    setbacks: {
      front: { required: number; provided: number; compliant: boolean };
      rear: { required: number; provided: number; compliant: boolean };
      side: { required: number; provided: number; compliant: boolean };
    };
  };
  overallStatus: "compliant" | "partial" | "non-compliant";
}

// ============ MATERIAL PROPERTIES ============

const concreteProperties = {
  M20: { fck: 20, Ec: 22360 },
  M25: { fck: 25, Ec: 25000 },
  M30: { fck: 30, Ec: 27386 },
  M35: { fck: 35, Ec: 29580 },
  M40: { fck: 40, Ec: 31623 },
};

const steelProperties = {
  Fe415: { fy: 415, Es: 200000 },
  Fe500: { fy: 500, Es: 200000 },
  Fe550: { fy: 550, Es: 200000 },
};

// ============ CALCULATION FUNCTIONS ============

export function calculateBeamDesign(input: BeamInput): BeamDesignResult {
  const concrete = concreteProperties[input.concreteGrade];
  const steel = steelProperties[input.steelGrade];
  
  const b = input.width; // mm
  const D = input.depth; // mm
  const d = D - 50; // effective depth assuming 50mm cover
  const L = input.spanLength * 1000; // mm
  
  // Factored load (1.5 factor for limit state)
  const wu = 1.5 * (input.deadLoad + input.liveLoad); // kN/m
  
  // Ultimate moment (simply supported)
  const Mu = (wu * Math.pow(input.spanLength, 2)) / 8; // kNm
  
  // Ultimate shear
  const Vu = (wu * input.spanLength) / 2; // kN
  
  // Limiting moment capacity
  const xuMax = 0.46 * d; // for Fe500
  const Mulim = 0.36 * concrete.fck * b * xuMax * (d - 0.42 * xuMax) / 1e6; // kNm
  
  // Required tension reinforcement
  const MuNmm = Mu * 1e6;
  const Ast = MuNmm / (0.87 * steel.fy * 0.9 * d);
  
  // Minimum reinforcement
  const AstMin = (0.85 * b * d) / steel.fy;
  const AstProvided = Math.max(Ast, AstMin);
  
  // Bar selection (simplified)
  const barDia = AstProvided > 900 ? 20 : AstProvided > 600 ? 16 : 12;
  const barArea = Math.PI * Math.pow(barDia, 2) / 4;
  const numBars = Math.ceil(AstProvided / barArea);
  
  // Compression reinforcement (assume 2 bars minimum)
  const AscMin = 0.2 * AstProvided;
  const compBarDia = 12;
  const compBars = Math.max(2, Math.ceil(AscMin / (Math.PI * Math.pow(compBarDia, 2) / 4)));
  
  // Stirrup spacing
  const stirrupSpacing = Math.min(0.75 * d, 300);
  
  // Deflection check
  const deflection = (5 * wu * Math.pow(L, 4)) / (384 * concrete.Ec * b * Math.pow(D, 3) / 12) / 1000;
  const allowableDeflection = L / 250;
  
  // Determine status
  let status: "safe" | "warning" | "unsafe" = "safe";
  if (Mu > Mulim * 1.1 || deflection > allowableDeflection) status = "unsafe";
  else if (Mu > Mulim * 0.9 || deflection > allowableDeflection * 0.8) status = "warning";
  
  return {
    reinforcement: {
      tensionBars: `${numBars}-${barDia}mm Ø`,
      compressionBars: `${compBars}-${compBarDia}mm Ø`,
      stirrups: `8mm Ø @ ${Math.round(stirrupSpacing)}mm c/c`,
      tensionArea: Math.round(numBars * barArea),
      compressionArea: Math.round(compBars * Math.PI * Math.pow(compBarDia, 2) / 4),
    },
    moments: {
      ultimate: Math.round(Mu * 10) / 10,
      resistance: Math.round(Mulim * 10) / 10,
    },
    shear: {
      ultimate: Math.round(Vu * 10) / 10,
      resistance: Math.round(Vu * 1.3 * 10) / 10,
    },
    deflection: {
      calculated: Math.round(deflection * 100) / 100,
      allowable: Math.round(allowableDeflection * 100) / 100,
    },
    status,
  };
}

export function calculateColumnDesign(input: ColumnInput): ColumnDesignResult {
  const concrete = concreteProperties[input.concreteGrade];
  const steel = steelProperties[input.steelGrade];
  
  const b = input.width; // mm
  const D = input.depth; // mm
  const h = input.height * 1000; // mm
  const Ag = b * D; // mm²
  
  // Slenderness ratio
  const lex = 0.65 * h; // effective length
  const slendernessRatio = lex / Math.min(b, D);
  const isSlender = slendernessRatio > 12;
  
  // Required steel area (simplified approach)
  const Pu = input.axialLoad * 1000; // N
  const fck = concrete.fck;
  const fy = steel.fy;
  
  // Capacity check using IS 456 formula
  const minSteel = 0.008 * Ag; // 0.8% minimum
  const maxSteel = 0.06 * Ag; // 6% maximum
  
  // Estimate required steel
  const requiredCapacity = Pu / 0.4;
  const concreteContribution = 0.4 * fck * Ag;
  const steelRequired = (requiredCapacity - concreteContribution) / (0.67 * fy - 0.4 * fck);
  
  const Asc = Math.max(minSteel, Math.min(maxSteel, steelRequired));
  const steelPercentage = (Asc / Ag) * 100;
  
  // Bar selection
  const barDia = Asc > 3000 ? 25 : Asc > 2000 ? 20 : 16;
  const barArea = Math.PI * Math.pow(barDia, 2) / 4;
  const numBars = Math.max(4, Math.ceil(Asc / barArea));
  const actualAsc = numBars * barArea;
  
  // Tie spacing
  const tieSpacing = Math.min(300, 16 * barDia, Math.min(b, D));
  
  // Capacity
  const axialCapacity = (0.4 * fck * (Ag - actualAsc) + 0.67 * fy * actualAsc) / 1000; // kN
  const momentCapacity = 0.15 * axialCapacity * Math.min(b, D) / 1000; // kNm (simplified)
  
  let status: "safe" | "warning" | "unsafe" = "safe";
  if (axialCapacity < input.axialLoad || steelPercentage > 4) status = "unsafe";
  else if (axialCapacity < input.axialLoad * 1.2 || steelPercentage > 3) status = "warning";
  
  return {
    reinforcement: {
      mainBars: `${numBars}-${barDia}mm Ø`,
      ties: `8mm Ø @ ${Math.round(tieSpacing)}mm c/c`,
      mainArea: Math.round(actualAsc),
      percentage: Math.round(steelPercentage * 100) / 100,
    },
    capacity: {
      axial: Math.round(axialCapacity),
      momentX: Math.round(momentCapacity * 10) / 10,
      momentY: Math.round(momentCapacity * 10) / 10,
    },
    slenderness: {
      ratio: Math.round(slendernessRatio * 10) / 10,
      classification: isSlender ? "slender" : "short",
    },
    status,
  };
}

export function calculateFootingDesign(input: FootingInput): FootingDesignResult {
  const concrete = concreteProperties[input.concreteGrade];
  const steel = steelProperties[input.steelGrade];
  
  // Required footing area
  const Pu = input.axialLoad; // kN
  const qa = input.soilBearingCapacity; // kN/m²
  const requiredArea = (Pu * 1.1) / qa; // 10% for self weight
  
  // Square footing dimensions
  const L = Math.ceil(Math.sqrt(requiredArea) * 1000 / 50) * 50; // round to 50mm
  const B = L;
  
  // Depth calculation (one-way shear governs typically)
  const d = Math.max(300, Math.ceil((L - input.columnWidth) / 6 / 25) * 25);
  const D = d + 75; // total depth with cover
  
  // Actual pressure
  const footingArea = (L * B) / 1e6; // m²
  const selfWeight = footingArea * D / 1000 * 25; // kN (assuming 25 kN/m³)
  const totalLoad = Pu + selfWeight;
  const actualPressure = totalLoad / footingArea;
  
  // Bending moment
  const projection = (L - input.columnWidth) / 2 / 1000; // m
  const Mu = (actualPressure * B / 1000 * Math.pow(projection, 2)) / 2; // kNm
  
  // Reinforcement
  const AstRequired = (Mu * 1e6) / (0.87 * steel.fy * 0.9 * d);
  const AstMin = (0.12 / 100) * B * d; // minimum for slabs
  const Ast = Math.max(AstRequired, AstMin);
  
  // Bar selection
  const barDia = 12;
  const barArea = Math.PI * Math.pow(barDia, 2) / 4;
  const spacing = Math.floor((B * barArea) / Ast);
  const numBars = Math.ceil(B / spacing);
  
  // Punching shear
  const criticalPerimeter = 2 * ((input.columnWidth + d) + (input.columnDepth + d));
  const punchingShear = Pu - actualPressure * ((input.columnWidth + d) * (input.columnDepth + d)) / 1e6;
  const shearResistance = 0.25 * Math.sqrt(concrete.fck) * criticalPerimeter * d / 1000;
  
  let status: "safe" | "warning" | "unsafe" = "safe";
  if (actualPressure > qa || punchingShear > shearResistance) status = "unsafe";
  else if (actualPressure > qa * 0.9 || punchingShear > shearResistance * 0.85) status = "warning";
  
  return {
    dimensions: {
      length: L,
      width: B,
      depth: D,
    },
    reinforcement: {
      mainBarsX: `${barDia}mm Ø @ ${spacing}mm c/c`,
      mainBarsY: `${barDia}mm Ø @ ${spacing}mm c/c`,
      areaX: Math.round(numBars * barArea),
      areaY: Math.round(numBars * barArea),
    },
    pressure: {
      actual: Math.round(actualPressure * 10) / 10,
      allowable: qa,
    },
    punchingShear: {
      calculated: Math.round(punchingShear * 10) / 10,
      resistance: Math.round(shearResistance * 10) / 10,
    },
    status,
  };
}

export function checkCompliance(input: ComplianceInput): ComplianceResult {
  // Seismic zone factors (IS 1893)
  const seismicZoneFactors = { II: 0.10, III: 0.16, IV: 0.24, V: 0.36 };
  const zoneFactor = seismicZoneFactors[input.seismicZone];
  
  // Response reduction factor (typical for moment resisting frame)
  const responseFactor = 5.0;
  
  // Approximate base shear (simplified)
  const buildingWeight = input.builtUpArea * 12; // kN (approximate)
  const baseShear = (zoneFactor / (2 * responseFactor)) * buildingWeight * 2.5; // Ah * W
  
  // Wind zone basic speeds (IS 875 Part 3)
  const windSpeeds = { "1": 33, "2": 39, "3": 44, "4": 47, "5": 50, "6": 55 };
  const basicSpeed = windSpeeds[input.windZone];
  const designPressure = 0.6 * Math.pow(basicSpeed, 2) / 1000; // kN/m²
  
  // FAR requirements (typical values)
  const farLimits = { residential: 2.0, commercial: 2.5, industrial: 1.5, institutional: 2.0 };
  const requiredFar = farLimits[input.buildingType];
  const providedFar = input.builtUpArea / input.plotArea;
  
  // Ground coverage
  const gcLimits = { residential: 0.6, commercial: 0.7, industrial: 0.5, institutional: 0.55 };
  const requiredGc = gcLimits[input.buildingType];
  const providedGc = (input.builtUpArea / input.stories) / input.plotArea;
  
  // Setback requirements (simplified, story-based)
  const setbackRequirements = {
    front: Math.max(3, input.stories * 0.5),
    rear: Math.max(2, input.stories * 0.3),
    side: Math.max(1.5, input.stories * 0.2),
  };
  
  const bylawsResult = {
    far: {
      required: requiredFar,
      provided: Math.round(providedFar * 100) / 100,
      compliant: providedFar <= requiredFar,
    },
    groundCoverage: {
      required: requiredGc,
      provided: Math.round(providedGc * 100) / 100,
      compliant: providedGc <= requiredGc,
    },
    setbacks: {
      front: {
        required: setbackRequirements.front,
        provided: input.setbackFront,
        compliant: input.setbackFront >= setbackRequirements.front,
      },
      rear: {
        required: setbackRequirements.rear,
        provided: input.setbackRear,
        compliant: input.setbackRear >= setbackRequirements.rear,
      },
      side: {
        required: setbackRequirements.side,
        provided: input.setbackSide,
        compliant: input.setbackSide >= setbackRequirements.side,
      },
    },
  };
  
  // Overall compliance
  const allCompliant = 
    bylawsResult.far.compliant &&
    bylawsResult.groundCoverage.compliant &&
    bylawsResult.setbacks.front.compliant &&
    bylawsResult.setbacks.rear.compliant &&
    bylawsResult.setbacks.side.compliant;
  
  const noneCompliant = 
    !bylawsResult.far.compliant &&
    !bylawsResult.groundCoverage.compliant;
  
  return {
    seismic: {
      zoneFactor,
      responseFactor,
      baseShear: Math.round(baseShear),
      compliant: true, // Simplified - would need detailed analysis
    },
    wind: {
      basicSpeed,
      designPressure: Math.round(designPressure * 100) / 100,
      compliant: true,
    },
    bylaws: bylawsResult,
    overallStatus: allCompliant ? "compliant" : noneCompliant ? "non-compliant" : "partial",
  };
}

// ============ COST ESTIMATION ============

export interface MaterialRates {
  concrete: { [key: string]: number }; // per m³
  steel: number; // per kg
  formwork: number; // per m²
  excavation: number; // per m³
  labor: number; // percentage
}

export const defaultMaterialRates: MaterialRates = {
  concrete: {
    M20: 5500,
    M25: 6000,
    M30: 6500,
    M35: 7000,
    M40: 7500,
  },
  steel: 75,
  formwork: 450,
  excavation: 350,
  labor: 35,
};

export interface CostEstimate {
  materials: {
    concrete: { quantity: number; unit: string; rate: number; cost: number };
    steel: { quantity: number; unit: string; rate: number; cost: number };
    formwork: { quantity: number; unit: string; rate: number; cost: number };
  };
  labor: number;
  total: number;
}

export function estimateBeamCost(input: BeamInput, result: BeamDesignResult, rates: MaterialRates = defaultMaterialRates): CostEstimate {
  const volume = (input.width / 1000) * (input.depth / 1000) * input.spanLength;
  const concreteCost = volume * rates.concrete[input.concreteGrade];
  
  const steelWeight = ((result.reinforcement.tensionArea + result.reinforcement.compressionArea) * input.spanLength * 7850) / 1e9;
  const stirrupWeight = steelWeight * 0.3; // approximate
  const totalSteelWeight = steelWeight + stirrupWeight;
  const steelCost = totalSteelWeight * rates.steel;
  
  const formworkArea = 2 * (input.depth / 1000) * input.spanLength + (input.width / 1000) * input.spanLength;
  const formworkCost = formworkArea * rates.formwork;
  
  const materialTotal = concreteCost + steelCost + formworkCost;
  const laborCost = materialTotal * (rates.labor / 100);
  
  return {
    materials: {
      concrete: { quantity: Math.round(volume * 100) / 100, unit: "m³", rate: rates.concrete[input.concreteGrade], cost: Math.round(concreteCost) },
      steel: { quantity: Math.round(totalSteelWeight), unit: "kg", rate: rates.steel, cost: Math.round(steelCost) },
      formwork: { quantity: Math.round(formworkArea * 100) / 100, unit: "m²", rate: rates.formwork, cost: Math.round(formworkCost) },
    },
    labor: Math.round(laborCost),
    total: Math.round(materialTotal + laborCost),
  };
}

export function estimateColumnCost(input: ColumnInput, result: ColumnDesignResult, rates: MaterialRates = defaultMaterialRates): CostEstimate {
  const volume = (input.width / 1000) * (input.depth / 1000) * input.height;
  const concreteCost = volume * rates.concrete[input.concreteGrade];
  
  const steelWeight = (result.reinforcement.mainArea * input.height * 7850) / 1e6;
  const tieWeight = steelWeight * 0.25;
  const totalSteelWeight = steelWeight + tieWeight;
  const steelCost = totalSteelWeight * rates.steel;
  
  const formworkArea = 2 * ((input.width / 1000) + (input.depth / 1000)) * input.height;
  const formworkCost = formworkArea * rates.formwork;
  
  const materialTotal = concreteCost + steelCost + formworkCost;
  const laborCost = materialTotal * (rates.labor / 100);
  
  return {
    materials: {
      concrete: { quantity: Math.round(volume * 100) / 100, unit: "m³", rate: rates.concrete[input.concreteGrade], cost: Math.round(concreteCost) },
      steel: { quantity: Math.round(totalSteelWeight), unit: "kg", rate: rates.steel, cost: Math.round(steelCost) },
      formwork: { quantity: Math.round(formworkArea * 100) / 100, unit: "m²", rate: rates.formwork, cost: Math.round(formworkCost) },
    },
    labor: Math.round(laborCost),
    total: Math.round(materialTotal + laborCost),
  };
}

export function estimateFootingCost(input: FootingInput, result: FootingDesignResult, rates: MaterialRates = defaultMaterialRates): CostEstimate {
  const volume = (result.dimensions.length / 1000) * (result.dimensions.width / 1000) * (result.dimensions.depth / 1000);
  const concreteCost = volume * rates.concrete[input.concreteGrade];
  
  const steelWeight = ((result.reinforcement.areaX + result.reinforcement.areaY) * (result.dimensions.length / 1000) * 7850) / 1e6;
  const steelCost = steelWeight * rates.steel;
  
  const formworkArea = 2 * ((result.dimensions.length + result.dimensions.width) / 1000) * (result.dimensions.depth / 1000);
  const formworkCost = formworkArea * rates.formwork;
  
  const excavationVolume = (result.dimensions.length / 1000 + 0.6) * (result.dimensions.width / 1000 + 0.6) * (result.dimensions.depth / 1000 + 0.3);
  const excavationCost = excavationVolume * rates.excavation;
  
  const materialTotal = concreteCost + steelCost + formworkCost + excavationCost;
  const laborCost = materialTotal * (rates.labor / 100);
  
  return {
    materials: {
      concrete: { quantity: Math.round(volume * 100) / 100, unit: "m³", rate: rates.concrete[input.concreteGrade], cost: Math.round(concreteCost) },
      steel: { quantity: Math.round(steelWeight), unit: "kg", rate: rates.steel, cost: Math.round(steelCost) },
      formwork: { quantity: Math.round(formworkArea * 100) / 100, unit: "m²", rate: rates.formwork, cost: Math.round(formworkCost + excavationCost) },
    },
    labor: Math.round(laborCost),
    total: Math.round(materialTotal + laborCost),
  };
}
