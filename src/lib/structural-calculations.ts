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
  beamType: z.enum(["simply_supported", "cantilever", "continuous"]).default("simply_supported"),
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
  endCondition: z.enum(["fixed_fixed", "fixed_hinged", "fixed_free", "hinged_hinged"]).default("fixed_fixed"),
});

export const footingInputSchema = z.object({
  columnWidth: z.number().min(200, "Column width must be at least 200mm").max(800, "Cannot exceed 800mm"),
  columnDepth: z.number().min(200, "Column depth must be at least 200mm").max(800, "Cannot exceed 800mm"),
  axialLoad: z.number().min(100, "Load must be at least 100 kN").max(5000, "Load cannot exceed 5000 kN"),
  soilBearingCapacity: z.number().min(50, "SBC must be at least 50 kN/m²").max(500, "SBC cannot exceed 500 kN/m²"),
  concreteGrade: z.enum(["M20", "M25", "M30", "M35", "M40"]),
  steelGrade: z.enum(["Fe415", "Fe500", "Fe550"]),
});

export const slabInputSchema = z.object({
  spanLx: z.number().min(1, "Short span must be at least 1m").max(10, "Cannot exceed 10m"),
  spanLy: z.number().min(1, "Long span must be at least 1m").max(10, "Cannot exceed 10m"),
  liveLoad: z.number().min(0.5, "Live load must be at least 0.5 kN/m²").max(25, "Cannot exceed 25 kN/m²"),
  floorFinish: z.number().min(0, "Cannot be negative").max(5, "Cannot exceed 5 kN/m²").default(1.0),
  concreteGrade: z.enum(["M20", "M25", "M30", "M35", "M40"]),
  steelGrade: z.enum(["Fe415", "Fe500", "Fe550"]),
  edgeCondition: z.enum([
    "all_edges_simply_supported",
    "one_long_edge_fixed",
    "one_short_edge_fixed",
    "two_adjacent_edges_fixed",
    "two_short_edges_fixed",
    "two_long_edges_fixed",
    "three_edges_fixed",
    "all_edges_fixed",
  ]).default("all_edges_simply_supported"),
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
export type SlabInput = z.infer<typeof slabInputSchema>;
export type ComplianceInput = z.infer<typeof complianceInputSchema>;

export interface CalculationStep {
  label: string;
  formula: string;
  substitution: string;
  result: string;
  clause?: string; // IS code clause reference
}

export interface BeamDesignResult {
  reinforcement: {
    tensionBars: string;
    compressionBars: string;
    stirrups: string;
    tensionArea: number;
    compressionArea: number;
  };
  moments: {
    ultimate: number;
    resistance: number;
  };
  shear: {
    ultimate: number;
    resistance: number;
  };
  deflection: {
    calculated: number;
    allowable: number;
  };
  steps: CalculationStep[];
  status: "safe" | "warning" | "unsafe";
}

export interface ColumnDesignResult {
  reinforcement: {
    mainBars: string;
    ties: string;
    mainArea: number;
    percentage: number;
  };
  capacity: {
    axial: number;
    momentX: number;
    momentY: number;
  };
  slenderness: {
    ratio: number;
    classification: "short" | "slender";
    additionalMoment: number;
  };
  steps: CalculationStep[];
  status: "safe" | "warning" | "unsafe";
}

export interface FootingDesignResult {
  dimensions: {
    length: number;
    width: number;
    depth: number;
  };
  reinforcement: {
    mainBarsX: string;
    mainBarsY: string;
    areaX: number;
    areaY: number;
  };
  pressure: {
    actual: number;
    allowable: number;
  };
  punchingShear: {
    calculated: number;
    resistance: number;
  };
  oneWayShear: {
    calculated: number;
    resistance: number;
  };
  steps: CalculationStep[];
  status: "safe" | "warning" | "unsafe";
}

export interface SlabDesignResult {
  slabType: "one-way" | "two-way";
  thickness: number; // mm
  effectiveDepth: number; // mm
  reinforcement: {
    shortSpanBars: string;
    longSpanBars: string;
    shortSpanArea: number;
    longSpanArea: number;
    distributionBars: string;
  };
  moments: {
    shortSpanPositive: number;
    shortSpanNegative: number;
    longSpanPositive: number;
    longSpanNegative: number;
  };
  deflection: {
    spanDepthRatio: number;
    allowableRatio: number;
  };
  steps: CalculationStep[];
  status: "safe" | "warning" | "unsafe";
}

export interface ComplianceResult {
  seismic: {
    zoneFactor: number;
    responseFactor: number;
    baseShear: number;
    compliant: boolean;
  };
  wind: {
    basicSpeed: number;
    designPressure: number;
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

// xu_max/d ratios per IS 456 Table 19
const xuMaxRatios: Record<string, number> = {
  Fe415: 0.48,
  Fe500: 0.46,
  Fe550: 0.44,
};

// ============ HELPER FUNCTIONS ============

function selectBars(areaRequired: number, minBars: number = 2): { diameter: number; count: number; areaProvided: number } {
  const diameters = [10, 12, 16, 20, 25, 32];
  for (const dia of diameters) {
    const barArea = Math.PI * Math.pow(dia, 2) / 4;
    const count = Math.max(minBars, Math.ceil(areaRequired / barArea));
    if (count <= 10) {
      return { diameter: dia, count, areaProvided: Math.round(count * barArea) };
    }
  }
  const dia = 32;
  const barArea = Math.PI * Math.pow(dia, 2) / 4;
  const count = Math.ceil(areaRequired / barArea);
  return { diameter: dia, count, areaProvided: Math.round(count * barArea) };
}

function r(val: number, decimals: number = 2): number {
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ============ IS 456 TABLE 19 – τc (N/mm²) ============

const tauCTable: { pt: number; M20: number; M25: number; M30: number; M35: number; M40: number }[] = [
  { pt: 0.15, M20: 0.28, M25: 0.29, M30: 0.29, M35: 0.29, M40: 0.30 },
  { pt: 0.25, M20: 0.36, M25: 0.36, M30: 0.37, M35: 0.37, M40: 0.38 },
  { pt: 0.50, M20: 0.48, M25: 0.49, M30: 0.50, M35: 0.50, M40: 0.51 },
  { pt: 0.75, M20: 0.56, M25: 0.57, M30: 0.59, M35: 0.59, M40: 0.60 },
  { pt: 1.00, M20: 0.62, M25: 0.64, M30: 0.66, M35: 0.67, M40: 0.68 },
  { pt: 1.25, M20: 0.67, M25: 0.70, M30: 0.71, M35: 0.73, M40: 0.74 },
  { pt: 1.50, M20: 0.72, M25: 0.74, M30: 0.76, M35: 0.78, M40: 0.79 },
  { pt: 1.75, M20: 0.75, M25: 0.78, M30: 0.80, M35: 0.82, M40: 0.84 },
  { pt: 2.00, M20: 0.79, M25: 0.82, M30: 0.84, M35: 0.86, M40: 0.88 },
  { pt: 2.25, M20: 0.81, M25: 0.85, M30: 0.88, M35: 0.90, M40: 0.92 },
  { pt: 2.50, M20: 0.82, M25: 0.88, M30: 0.91, M35: 0.93, M40: 0.95 },
  { pt: 2.75, M20: 0.82, M25: 0.90, M30: 0.94, M35: 0.96, M40: 0.98 },
  { pt: 3.00, M20: 0.82, M25: 0.92, M30: 0.96, M35: 0.99, M40: 1.01 },
];

function getTauC(pt: number, grade: string): number {
  const gradeKey = grade as keyof typeof tauCTable[0];
  const table = tauCTable;
  if (pt <= table[0].pt) return table[0][gradeKey] as number;
  if (pt >= table[table.length - 1].pt) return table[table.length - 1][gradeKey] as number;
  for (let i = 0; i < table.length - 1; i++) {
    if (pt >= table[i].pt && pt <= table[i + 1].pt) {
      const ratio = (pt - table[i].pt) / (table[i + 1].pt - table[i].pt);
      return r((table[i][gradeKey] as number) + ratio * ((table[i + 1][gradeKey] as number) - (table[i][gradeKey] as number)), 3);
    }
  }
  return table[table.length - 1][gradeKey] as number;
}

// ============ BEAM DESIGN (IS 456:2000) ============

export function calculateBeamDesign(input: BeamInput): BeamDesignResult {
  const concrete = concreteProperties[input.concreteGrade];
  const steel = steelProperties[input.steelGrade];
  const steps: CalculationStep[] = [];

  const b = input.width;
  const D = input.depth;
  const cover = 25 + 8; // clear cover + stirrup dia
  const d = D - cover - 10; // assuming 20mm bar, half dia
  const L = input.spanLength * 1000;
  const beamType = input.beamType || "simply_supported";

  steps.push({
    label: "Effective Depth",
    formula: "d = D − clear cover − stirrup dia − (bar dia / 2)",
    substitution: `d = ${D} − 25 − 8 − 10`,
    result: `d = ${d} mm`,
    clause: "IS 456 Cl. 26.4.1",
  });

  // Factored load
  const wu = 1.5 * (input.deadLoad + input.liveLoad);
  steps.push({
    label: "Factored Load (Load Factor = 1.5)",
    formula: "wu = 1.5 × (DL + LL)",
    substitution: `wu = 1.5 × (${input.deadLoad} + ${input.liveLoad})`,
    result: `wu = ${r(wu)} kN/m`,
    clause: "IS 456 Cl. 36.4.1 (Table 18)",
  });

  // Ultimate moment based on beam type
  let Mu: number;
  let Vu: number;
  if (beamType === "cantilever") {
    Mu = (wu * Math.pow(input.spanLength, 2)) / 2;
    Vu = wu * input.spanLength;
    steps.push({
      label: "Ultimate Moment (Cantilever)",
      formula: "Mu = wu × L² / 2",
      substitution: `Mu = ${r(wu)} × ${input.spanLength}² / 2`,
      result: `Mu = ${r(Mu)} kNm`,
    });
  } else if (beamType === "continuous") {
    Mu = (wu * Math.pow(input.spanLength, 2)) / 10;
    Vu = 0.6 * wu * input.spanLength;
    steps.push({
      label: "Ultimate Moment (Continuous, midspan)",
      formula: "Mu = wu × L² / 10",
      substitution: `Mu = ${r(wu)} × ${input.spanLength}² / 10`,
      result: `Mu = ${r(Mu)} kNm`,
    });
  } else {
    Mu = (wu * Math.pow(input.spanLength, 2)) / 8;
    Vu = (wu * input.spanLength) / 2;
    steps.push({
      label: "Ultimate Moment (Simply Supported)",
      formula: "Mu = wu × L² / 8",
      substitution: `Mu = ${r(wu)} × ${input.spanLength}² / 8`,
      result: `Mu = ${r(Mu)} kNm`,
    });
  }

  steps.push({
    label: "Ultimate Shear Force",
    formula: beamType === "cantilever" ? "Vu = wu × L" : beamType === "continuous" ? "Vu = 0.6 × wu × L" : "Vu = wu × L / 2",
    substitution: beamType === "cantilever" ? `Vu = ${r(wu)} × ${input.spanLength}` : beamType === "continuous" ? `Vu = 0.6 × ${r(wu)} × ${input.spanLength}` : `Vu = ${r(wu)} × ${input.spanLength} / 2`,
    result: `Vu = ${r(Vu)} kN`,
  });

  // Unit conversion step
  const MuNmm = Mu * 1e6;
  steps.push({
    label: "Convert Mu to N·mm",
    formula: "Mu (N·mm) = Mu (kNm) × 10⁶",
    substitution: `Mu = ${r(Mu)} × 10⁶`,
    result: `Mu = ${r(MuNmm, 0)} N·mm`,
  });

  // Limiting moment capacity (IS 456 Annex G)
  const xuMaxD = xuMaxRatios[input.steelGrade];
  const xuMax = xuMaxD * d;
  const Mulim = 0.36 * concrete.fck * b * xuMax * (d - 0.42 * xuMax) / 1e6;

  steps.push({
    label: "Limiting Moment Capacity",
    formula: "Mu,lim = 0.36 × fck × b × xu,max × (d − 0.42 × xu,max)",
    substitution: `xu,max/d = ${xuMaxD} (${input.steelGrade}), xu,max = ${xuMaxD} × ${d} = ${r(xuMax)} mm\nMu,lim = 0.36 × ${concrete.fck} × ${b} × ${r(xuMax)} × (${d} − 0.42 × ${r(xuMax)}) / 10⁶`,
    result: `Mu,lim = ${r(Mulim)} kNm → Beam is ${Mu <= Mulim ? "Singly Reinforced ✓" : "Doubly Reinforced"}`,
    clause: "IS 456 Annex G, Cl. G-1.1",
  });

  // Required tension reinforcement
  let Ast: number;
  let AscRequired = 0;

  // Compute the discriminant term clearly
  const discriminant = (4.6 * MuNmm) / (concrete.fck * b * d * d);

  if (Mu <= Mulim) {
    // Singly reinforced
    const sqrtTerm = Math.sqrt(1 - discriminant);
    Ast = (0.5 * concrete.fck * b * d / steel.fy) * (1 - sqrtTerm);

    steps.push({
      label: "Tension Reinforcement Ast (Singly Reinforced)",
      formula: "Ast = (0.5 × fck × b × d / fy) × [1 − √(1 − 4.6Mu / (fck × b × d²))]",
      substitution: `Inner term = 4.6 × ${r(MuNmm, 0)} / (${concrete.fck} × ${b} × ${d}²)\n= ${r(discriminant, 6)}\n√(1 − ${r(discriminant, 6)}) = ${r(sqrtTerm, 6)}\nAst = (0.5 × ${concrete.fck} × ${b} × ${d} / ${steel.fy}) × (1 − ${r(sqrtTerm, 6)})`,
      result: `Ast = ${r(Ast)} mm²`,
      clause: "IS 456 Annex G, Cl. G-1.1(b)",
    });
  } else {
    // Doubly reinforced
    const discriminantLim = (4.6 * Mulim * 1e6) / (concrete.fck * b * d * d);
    const sqrtTermLim = Math.sqrt(1 - discriminantLim);
    const Ast1 = (0.5 * concrete.fck * b * d / steel.fy) * (1 - sqrtTermLim);
    const Mu2 = Mu - Mulim;
    const dPrime = 50;
    const Ast2 = (Mu2 * 1e6) / (0.87 * steel.fy * (d - dPrime));
    Ast = Ast1 + Ast2;
    AscRequired = (Mu2 * 1e6) / ((0.87 * steel.fy - 0.447 * concrete.fck) * (d - dPrime));

    steps.push({
      label: "Tension Reinforcement (Doubly Reinforced)",
      formula: "Mu > Mu,lim → Doubly reinforced beam required",
      substitution: `Ast1 (for Mu,lim) = ${r(Ast1)} mm²\nMu2 = ${r(Mu)} − ${r(Mulim)} = ${r(Mu2)} kNm\nAst2 = Mu2 × 10⁶ / (0.87 × fy × (d − d')) = ${r(Mu2 * 1e6, 0)} / (0.87 × ${steel.fy} × (${d} − ${dPrime}))`,
      result: `Ast1 = ${r(Ast1)} mm², Ast2 = ${r(Ast2)} mm², Total Ast = ${r(Ast)} mm²\nAsc = ${r(AscRequired)} mm²`,
      clause: "IS 456 Annex G",
    });
  }

  // Minimum reinforcement check (IS 456 Cl. 26.5.1.1)
  const AstMin = (0.85 * b * d) / steel.fy;
  const AstProvided = Math.max(Ast, AstMin);

  steps.push({
    label: "Minimum Reinforcement Check",
    formula: "Ast,min = 0.85 × b × d / fy",
    substitution: `Ast,min = 0.85 × ${b} × ${d} / ${steel.fy}`,
    result: `Ast,min = ${r(AstMin)} mm² → ${AstProvided > Ast ? "Ast,min governs" : "Calculated Ast governs"} → Ast required = ${r(AstProvided)} mm²`,
    clause: "IS 456 Cl. 26.5.1.1",
  });

  // Bar selection
  const tension = selectBars(AstProvided, 2);
  const compression = selectBars(Math.max(AscRequired, 0.2 * tension.areaProvided), 2);

  steps.push({
    label: "Bar Selection (Tension)",
    formula: "Select economical bar diameter and count ≥ Ast required",
    substitution: `Required Ast = ${r(AstProvided)} mm²`,
    result: `Provide ${tension.count}–${tension.diameter}mm Ø bars (Ast provided = ${tension.areaProvided} mm²)`,
  });

  // ===== COMPLETE SHEAR DESIGN (IS 456 Cl. 40) =====

  // Step (a): Nominal shear stress
  const VuN = Vu * 1000; // Convert kN to N
  const tauV = VuN / (b * d);
  steps.push({
    label: "Nominal Shear Stress (τv)",
    formula: "τv = Vu / (b × d)",
    substitution: `τv = ${r(VuN, 0)} / (${b} × ${d})`,
    result: `τv = ${r(tauV, 3)} N/mm²`,
    clause: "IS 456 Cl. 40.1",
  });

  // Step (b): Percentage of steel & τc from Table 19
  const pt = r((100 * tension.areaProvided) / (b * d), 3);
  const tauC = getTauC(pt, input.concreteGrade);

  steps.push({
    label: "Percentage of Steel & τc from IS 456 Table 19",
    formula: "Pt = 100 × Ast / (b × d), then lookup τc from Table 19",
    substitution: `Pt = 100 × ${tension.areaProvided} / (${b} × ${d}) = ${pt}%`,
    result: `τc = ${tauC} N/mm² (for Pt = ${pt}%, ${input.concreteGrade})`,
    clause: "IS 456 Table 19",
  });

  // Step (c): Compare τv with τc
  steps.push({
    label: "Shear Check: τv vs τc",
    formula: "If τv > τc → shear reinforcement required",
    substitution: `τv = ${r(tauV, 3)} N/mm², τc = ${tauC} N/mm²`,
    result: tauV > tauC ? `τv > τc → Shear reinforcement REQUIRED` : `τv ≤ τc → Minimum shear reinforcement sufficient`,
  });

  // Step (d): Shear resisted by concrete
  const Vc = tauC * b * d; // in N
  steps.push({
    label: "Shear Resisted by Concrete (Vc)",
    formula: "Vc = τc × b × d",
    substitution: `Vc = ${tauC} × ${b} × ${d}`,
    result: `Vc = ${r(Vc, 0)} N = ${r(Vc / 1000)} kN`,
    clause: "IS 456 Cl. 40.2",
  });

  // Step (e): Shear to be resisted by stirrups
  const Vs = Math.max(0, VuN - Vc);
  steps.push({
    label: "Shear to be Resisted by Stirrups (Vs)",
    formula: "Vs = Vu − Vc",
    substitution: `Vs = ${r(VuN, 0)} − ${r(Vc, 0)}`,
    result: `Vs = ${r(Vs, 0)} N = ${r(Vs / 1000)} kN`,
  });

  // Step (f): Stirrup spacing
  const Asv = 2 * Math.PI * Math.pow(8, 2) / 4; // 2-legged 8mm stirrups
  let svCalc: number;
  if (Vs > 0) {
    svCalc = (0.87 * steel.fy * Asv * d) / Vs;
  } else {
    // Minimum stirrups
    svCalc = (0.87 * steel.fy * Asv) / (0.4 * b);
  }
  const svMax = Math.min(0.75 * d, 300); // IS 456 Cl. 26.5.1.5
  const sv = Math.min(Math.floor(svCalc / 5) * 5, svMax); // round to 5mm

  steps.push({
    label: "Stirrup Spacing Calculation",
    formula: Vs > 0 ? "Sv = (0.87 × fy × Asv × d) / Vs" : "Sv (min) = (0.87 × fy × Asv) / (0.4 × b)",
    substitution: Vs > 0
      ? `Asv (2L-8mm) = ${r(Asv)} mm²\nSv = (0.87 × ${steel.fy} × ${r(Asv)} × ${d}) / ${r(Vs, 0)}`
      : `Asv (2L-8mm) = ${r(Asv)} mm²\nSv = (0.87 × ${steel.fy} × ${r(Asv)}) / (0.4 × ${b})`,
    result: `Sv (calc) = ${r(svCalc)} mm\nSv,max = min(0.75d, 300) = ${r(svMax)} mm\n✓ Provide 8mm Ø 2-legged stirrups @ ${sv} mm c/c`,
    clause: "IS 456 Cl. 40.4, Cl. 26.5.1.5",
  });

  // Deflection check (IS 456 Cl. 23.2)
  const spanDepthRatio = L / d;
  let basicRatio = beamType === "cantilever" ? 7 : beamType === "continuous" ? 26 : 20;
  // Modification factor for tension reinforcement (IS 456 Fig. 4)
  const fs = 0.58 * steel.fy * AstProvided / tension.areaProvided;
  const mf = Math.max(0.8, Math.min(2.0, 1.6 - 0.002 * fs));
  const allowableRatio = basicRatio * mf;
  const deflectionOk = spanDepthRatio <= allowableRatio;

  steps.push({
    label: "Deflection Check (Span/Depth Ratio)",
    formula: "L/d ≤ Basic ratio × Modification factor (MF)",
    substitution: `fs = 0.58 × ${steel.fy} × ${r(AstProvided)} / ${tension.areaProvided} = ${r(fs)} N/mm²\nMF = ${r(mf)}\nL/d = ${L} / ${d} = ${r(spanDepthRatio)}\nAllowable = ${basicRatio} × ${r(mf)} = ${r(allowableRatio)}`,
    result: deflectionOk ? `${r(spanDepthRatio)} ≤ ${r(allowableRatio)} → SAFE ✓` : `${r(spanDepthRatio)} > ${r(allowableRatio)} → UNSAFE – Increase depth`,
    clause: "IS 456 Cl. 23.2.1, Fig. 4",
  });

  // Simplified deflection in mm
  const I = (b * Math.pow(D, 3)) / 12;
  const deflection = beamType === "cantilever"
    ? (wu * Math.pow(L, 4)) / (8 * concrete.Ec * I) / 1000
    : (5 * wu * Math.pow(L, 4)) / (384 * concrete.Ec * I) / 1000;
  const allowableDeflection = beamType === "cantilever" ? L / 150 : L / 250;

  let status: "safe" | "warning" | "unsafe" = "safe";
  if (Mu > Mulim * 1.1 || !deflectionOk) status = "unsafe";
  else if (Mu > Mulim * 0.9 || spanDepthRatio > allowableRatio * 0.9) status = "warning";

  return {
    reinforcement: {
      tensionBars: `${tension.count}–${tension.diameter}mm Ø`,
      compressionBars: `${compression.count}–${compression.diameter}mm Ø`,
      stirrups: `8mm Ø 2L @ ${sv}mm c/c`,
      tensionArea: tension.areaProvided,
      compressionArea: compression.areaProvided,
    },
    moments: {
      ultimate: r(Mu, 1),
      resistance: r(Mulim, 1),
    },
    shear: {
      ultimate: r(Vu, 1),
      resistance: r(Vc / 1000, 1),
    },
    deflection: {
      calculated: r(deflection),
      allowable: r(allowableDeflection),
    },
    steps,
    status,
  };
}

// ============ COLUMN DESIGN (IS 456:2000) ============

export function calculateColumnDesign(input: ColumnInput): ColumnDesignResult {
  const concrete = concreteProperties[input.concreteGrade];
  const steel = steelProperties[input.steelGrade];
  const steps: CalculationStep[] = [];

  const b = input.width;
  const D = input.depth;
  const h = input.height * 1000;
  const Ag = b * D;

  // Effective length factor based on end condition
  const endCondition = input.endCondition || "fixed_fixed";
  const effLengthFactors: Record<string, number> = {
    fixed_fixed: 0.65,
    fixed_hinged: 0.80,
    hinged_hinged: 1.00,
    fixed_free: 2.00,
  };
  const kFactor = effLengthFactors[endCondition];
  const lex = kFactor * h;
  const ley = kFactor * h;

  steps.push({
    label: "Effective Length",
    formula: "le = k × L (based on end conditions)",
    substitution: `k = ${kFactor} (${endCondition.replace(/_/g, "-")}), le = ${kFactor} × ${h}`,
    result: `lex = ley = ${r(lex)} mm`,
    clause: "IS 456 Table 28",
  });

  // Slenderness ratio
  const slendernessX = lex / b;
  const slendernessY = ley / D;
  const maxSlenderness = Math.max(slendernessX, slendernessY);
  const isSlender = maxSlenderness > 12;

  steps.push({
    label: "Slenderness Check",
    formula: "λ = le / lateral dimension, Short if λ ≤ 12",
    substitution: `λx = ${r(lex)}/${b} = ${r(slendernessX)}, λy = ${r(ley)}/${D} = ${r(slendernessY)}`,
    result: `λ_max = ${r(maxSlenderness)} → ${isSlender ? "SLENDER Column" : "SHORT Column"}`,
    clause: "IS 456 Cl. 25.1.2",
  });

  // Additional moment for slender columns (IS 456 Cl. 39.7)
  let Madd = 0;
  if (isSlender) {
    const eaX = (D * Math.pow(lex / D, 2)) / 2000;
    const eaY = (b * Math.pow(ley / b, 2)) / 2000;
    Madd = input.axialLoad * Math.max(eaX, eaY) / 1000; // kNm
    steps.push({
      label: "Additional Moment (Slender Column)",
      formula: "ea = D × (le/D)² / 2000, Ma = Pu × ea",
      substitution: `ea = ${D} × (${r(lex)}/${D})² / 2000 = ${r(Math.max(eaX, eaY))} mm`,
      result: `Ma = ${r(Madd)} kNm`,
      clause: "IS 456 Cl. 39.7.1",
    });
  }

  const totalMomentX = input.momentX + (isSlender ? Madd : 0);
  const totalMomentY = input.momentY + (isSlender ? Madd : 0);

  // Required steel area (IS 456 Cl. 39.3 for short, 39.5 for slender)
  const Pu = input.axialLoad * 1000; // N
  const fck = concrete.fck;
  const fy = steel.fy;

  // IS 456 Cl. 39.3: Pu = 0.4×fck×Ac + 0.67×fy×Asc (for short axially loaded)
  const minSteel = 0.008 * Ag; // 0.8% minimum (Cl. 26.5.3.1)
  const maxSteel = 0.06 * Ag; // 6% maximum

  // Estimate required steel from axial capacity
  const concreteContribution = 0.4 * fck * Ag;
  const steelRequired = (Pu - concreteContribution) / (0.67 * fy - 0.4 * fck);

  const Asc = Math.max(minSteel, Math.min(maxSteel, steelRequired));
  const steelPercentage = (Asc / Ag) * 100;

  steps.push({
    label: "Axial Load Capacity",
    formula: "Pu = 0.4×fck×Ac + 0.67×fy×Asc",
    substitution: `Concrete: 0.4×${fck}×${Ag} = ${r(concreteContribution/1000)} kN`,
    result: `Required Asc = ${r(Asc)} mm² (${r(steelPercentage)}%)`,
    clause: "IS 456 Cl. 39.3",
  });

  steps.push({
    label: "Steel Percentage Check",
    formula: "0.8% ≤ p ≤ 6% (IS 456 Cl. 26.5.3.1)",
    substitution: `p = ${r(steelPercentage)}%`,
    result: steelPercentage >= 0.8 && steelPercentage <= 6 ? "Within limits" : "Outside limits – revise section",
    clause: "IS 456 Cl. 26.5.3.1",
  });

  // Bar selection
  const bars = selectBars(Asc, 4);
  const actualAsc = bars.areaProvided;

  // Tie spacing (IS 456 Cl. 26.5.3.2)
  const tieSpacing = Math.min(
    Math.min(b, D),
    16 * bars.diameter,
    300
  );

  steps.push({
    label: "Lateral Ties",
    formula: "Spacing ≤ min(least dimension, 16×bar dia, 300mm)",
    substitution: `min(${Math.min(b, D)}, ${16 * bars.diameter}, 300)`,
    result: `8mm Ø @ ${tieSpacing}mm c/c`,
    clause: "IS 456 Cl. 26.5.3.2(c)",
  });

  // Capacity
  const axialCapacity = (0.4 * fck * (Ag - actualAsc) + 0.67 * fy * actualAsc) / 1000;
  // Simplified moment capacity using interaction
  const Mu_cap = 0.4 * fck * b * D * D * (1 - Pu / (fck * b * D)) / 1e6;
  const momentCapacity = Math.max(Mu_cap, 0.05 * axialCapacity * Math.min(b, D) / 1000);

  let status: "safe" | "warning" | "unsafe" = "safe";
  if (axialCapacity < input.axialLoad || steelPercentage > 6) status = "unsafe";
  else if (axialCapacity < input.axialLoad * 1.2 || steelPercentage > 4) status = "warning";

  return {
    reinforcement: {
      mainBars: `${bars.count}-${bars.diameter}mm Ø`,
      ties: `8mm Ø @ ${tieSpacing}mm c/c`,
      mainArea: actualAsc,
      percentage: r(steelPercentage),
    },
    capacity: {
      axial: Math.round(axialCapacity),
      momentX: r(momentCapacity, 1),
      momentY: r(momentCapacity, 1),
    },
    slenderness: {
      ratio: r(maxSlenderness, 1),
      classification: isSlender ? "slender" : "short",
      additionalMoment: r(Madd, 1),
    },
    steps,
    status,
  };
}

// ============ FOOTING DESIGN (IS 456:2000) ============

export function calculateFootingDesign(input: FootingInput): FootingDesignResult {
  const concrete = concreteProperties[input.concreteGrade];
  const steel = steelProperties[input.steelGrade];
  const steps: CalculationStep[] = [];

  const Pu = input.axialLoad;
  const qa = input.soilBearingCapacity;

  // Working load (service load)
  const P = Pu / 1.5; // Unfactored
  const requiredArea = (P * 1.1) / qa; // 10% for self weight

  steps.push({
    label: "Required Footing Area",
    formula: "A = P × 1.1 / qa (10% self-weight allowance)",
    substitution: `A = ${r(P)} × 1.1 / ${qa}`,
    result: `A = ${r(requiredArea)} m²`,
    clause: "IS 456 Cl. 34.1",
  });

  // Square footing dimensions
  const L = Math.ceil(Math.sqrt(requiredArea) * 1000 / 50) * 50;
  const B = L;

  steps.push({
    label: "Footing Size",
    formula: "L = B = √A (rounded to 50mm)",
    substitution: `L = B = √${r(requiredArea)} × 1000`,
    result: `L = B = ${L} mm (${r(L / 1000, 2)} m)`,
  });

  // Factored net upward pressure
  const footingArea = (L * B) / 1e6;
  const quNet = (Pu / footingArea); // kN/m²

  steps.push({
    label: "Net Factored Upward Pressure",
    formula: "qu = Pu / A_footing",
    substitution: `qu = ${Pu} / ${r(footingArea)}`,
    result: `qu = ${r(quNet)} kN/m²`,
  });

  // Bending moment at column face
  const projection = (L - input.columnWidth) / 2; // mm
  const Mu = quNet * (B / 1000) * Math.pow(projection / 1000, 2) / 2; // kNm

  steps.push({
    label: "Bending Moment at Column Face",
    formula: "Mu = qu × B × (projection)² / 2",
    substitution: `Mu = ${r(quNet)} × ${r(B / 1000)} × (${r(projection / 1000)})² / 2`,
    result: `Mu = ${r(Mu)} kNm`,
    clause: "IS 456 Cl. 34.2.3.2",
  });

  // Depth from bending
  const dBending = Math.sqrt(Mu * 1e6 / (0.138 * concrete.fck * B));

  // One-way shear check to determine depth
  // Critical section at d from column face
  // Assume d, then check
  let d = Math.max(300, Math.ceil(dBending / 25) * 25);

  // Iterate to find adequate d for one-way shear
  const tauC_footing = 0.25 * Math.sqrt(concrete.fck); // conservative
  for (let iter = 0; iter < 5; iter++) {
    const shearSection = projection - d * 1000 / 1000; // mm from edge
    if (shearSection <= 0) break;
    const Vu1 = quNet * (B / 1000) * (shearSection / 1000); // kN
    const tauV1 = (Vu1 * 1000) / (B * d);
    if (tauV1 > tauC_footing) {
      d += 25;
    } else {
      break;
    }
  }

  const D = d + 75; // total depth with cover

  steps.push({
    label: "Depth of Footing",
    formula: "d from bending and one-way shear check",
    substitution: `d_bending = ${r(dBending)} mm, d_shear governed`,
    result: `d = ${d} mm, D = ${D} mm`,
    clause: "IS 456 Cl. 34.2.4",
  });

  // Reinforcement
  const AstRequired = (Mu * 1e6) / (0.87 * steel.fy * 0.9 * d);
  const AstMin = (0.12 / 100) * B * d;
  const Ast = Math.max(AstRequired, AstMin);

  const bars = selectBars(Ast, 4);
  const spacing = Math.floor((B * Math.PI * Math.pow(bars.diameter, 2) / 4) / Ast);
  const actualSpacing = Math.min(spacing, 200);

  steps.push({
    label: "Reinforcement",
    formula: "Ast = Mu / (0.87 × fy × 0.9 × d)",
    substitution: `Ast = ${r(Mu * 1e6)} / (0.87 × ${steel.fy} × 0.9 × ${d})`,
    result: `Ast = ${r(Ast)} mm², Provide ${bars.diameter}mm @ ${actualSpacing}mm c/c`,
    clause: "IS 456 Cl. 34.3",
  });

  // Punching shear (IS 456 Cl. 31.6.1)
  const critPerimeter = 2 * ((input.columnWidth + d) + (input.columnDepth + d));
  const punchingArea = ((input.columnWidth + d) * (input.columnDepth + d)) / 1e6;
  const punchingShear = Pu - quNet * punchingArea;
  const tauP = (punchingShear * 1000) / (critPerimeter * d);
  const tauPAllow = 0.25 * Math.sqrt(concrete.fck);

  steps.push({
    label: "Punching Shear Check",
    formula: "τv = Vu_punch / (bo × d) ≤ 0.25√fck",
    substitution: `bo = ${critPerimeter}mm, Vu = ${r(punchingShear)} kN`,
    result: `τv = ${r(tauP, 3)} N/mm² ${tauP <= tauPAllow ? "≤" : ">"} ${r(tauPAllow, 3)} N/mm² → ${tauP <= tauPAllow ? "SAFE" : "UNSAFE"}`,
    clause: "IS 456 Cl. 31.6.1",
  });

  // One-way shear check
  const shearSection = (projection - d) / 1000; // m from edge
  const Vu1Way = shearSection > 0 ? quNet * (B / 1000) * shearSection : 0;
  const tauV1Way = Vu1Way > 0 ? (Vu1Way * 1000) / (B * d) : 0;

  steps.push({
    label: "One-Way Shear Check",
    formula: "τv = Vu / (b × d) at d from column face",
    substitution: `Vu = ${r(Vu1Way)} kN`,
    result: `τv = ${r(tauV1Way, 3)} N/mm² ${tauV1Way <= tauC_footing ? "≤" : ">"} τc = ${r(tauC_footing, 3)} → ${tauV1Way <= tauC_footing ? "SAFE" : "UNSAFE"}`,
    clause: "IS 456 Cl. 34.2.4",
  });

  // Actual soil pressure check
  const selfWeight = footingArea * D / 1000 * 25;
  const actualPressure = (P + selfWeight) / footingArea;

  let status: "safe" | "warning" | "unsafe" = "safe";
  if (actualPressure > qa || tauP > tauPAllow) status = "unsafe";
  else if (actualPressure > qa * 0.9 || tauP > tauPAllow * 0.85) status = "warning";

  const numBarsInSpan = Math.ceil(L / actualSpacing);

  return {
    dimensions: { length: L, width: B, depth: D },
    reinforcement: {
      mainBarsX: `${bars.diameter}mm Ø @ ${actualSpacing}mm c/c`,
      mainBarsY: `${bars.diameter}mm Ø @ ${actualSpacing}mm c/c`,
      areaX: Math.round(numBarsInSpan * Math.PI * Math.pow(bars.diameter, 2) / 4),
      areaY: Math.round(numBarsInSpan * Math.PI * Math.pow(bars.diameter, 2) / 4),
    },
    pressure: {
      actual: r(actualPressure, 1),
      allowable: qa,
    },
    punchingShear: {
      calculated: r(punchingShear, 1),
      resistance: r(tauPAllow * critPerimeter * d / 1000, 1),
    },
    oneWayShear: {
      calculated: r(Vu1Way, 1),
      resistance: r(tauC_footing * B * d / 1000, 1),
    },
    steps,
    status,
  };
}

// ============ SLAB DESIGN (IS 456:2000) ============

// IS 456 Table 26 - Bending moment coefficients for rectangular slabs
const slabCoefficients: Record<string, { alphaX: number[]; alphaY: number[] }> = {
  // [negative, positive] for each ratio
  all_edges_simply_supported: { alphaX: [0, 0.056], alphaY: [0, 0.056] },
  one_long_edge_fixed: { alphaX: [0.043, 0.035], alphaY: [0, 0.043] },
  one_short_edge_fixed: { alphaX: [0, 0.043], alphaY: [0.043, 0.035] },
  two_adjacent_edges_fixed: { alphaX: [0.047, 0.035], alphaY: [0.047, 0.035] },
  two_short_edges_fixed: { alphaX: [0.058, 0.043], alphaY: [0, 0.043] },
  two_long_edges_fixed: { alphaX: [0, 0.043], alphaY: [0.058, 0.043] },
  three_edges_fixed: { alphaX: [0.057, 0.043], alphaY: [0.057, 0.043] },
  all_edges_fixed: { alphaX: [0.032, 0.024], alphaY: [0.032, 0.024] },
};

export function calculateSlabDesign(input: SlabInput): SlabDesignResult {
  const concrete = concreteProperties[input.concreteGrade];
  const steel = steelProperties[input.steelGrade];
  const steps: CalculationStep[] = [];

  const lx = Math.min(input.spanLx, input.spanLy); // short span
  const ly = Math.max(input.spanLx, input.spanLy); // long span
  const ratio = ly / lx;
  const slabType = ratio > 2 ? "one-way" : "two-way";

  steps.push({
    label: "Slab Classification",
    formula: "ly/lx > 2 → One-way, ly/lx ≤ 2 → Two-way",
    substitution: `ly/lx = ${r(ly)}/${r(lx)} = ${r(ratio)}`,
    result: `${slabType.toUpperCase()} slab`,
    clause: "IS 456 Cl. 24.4",
  });

  // Preliminary depth (IS 456 Cl. 23.2)
  const basicRatio = slabType === "one-way" ? 20 : 26; // simply supported basic
  const mf = 1.5; // assumed modification factor
  const dPrelim = Math.ceil((lx * 1000) / (basicRatio * mf));
  const d = Math.max(100, Math.ceil(dPrelim / 5) * 5);
  const cover = 20; // clear cover for slab
  const D_slab = d + cover + 5; // half bar dia

  steps.push({
    label: "Depth from Serviceability",
    formula: "d = Lx / (basic ratio × MF)",
    substitution: `d = ${lx * 1000} / (${basicRatio} × ${mf})`,
    result: `d = ${d} mm, D = ${D_slab} mm`,
    clause: "IS 456 Cl. 23.2.1",
  });

  // Loads
  const selfWeight = D_slab / 1000 * 25; // kN/m²
  const floorFinish = input.floorFinish || 1.0;
  const totalDL = selfWeight + floorFinish;
  const wu = 1.5 * (totalDL + input.liveLoad); // kN/m²

  steps.push({
    label: "Factored Load",
    formula: "wu = 1.5 × (DL + LL)",
    substitution: `DL = ${r(selfWeight)} (self) + ${floorFinish} (finish) = ${r(totalDL)}, LL = ${input.liveLoad}`,
    result: `wu = 1.5 × ${r(totalDL + input.liveLoad)} = ${r(wu)} kN/m²`,
    clause: "IS 456 Cl. 36.4.1",
  });

  let MxPos: number, MxNeg: number, MyPos: number, MyNeg: number;

  if (slabType === "one-way") {
    // One-way slab: moment = wl²/8 (simply supported)
    MxPos = (wu * Math.pow(lx, 2)) / 8;
    MxNeg = 0;
    MyPos = 0;
    MyNeg = 0;

    steps.push({
      label: "Bending Moment (One-way)",
      formula: "Mx = wu × lx² / 8",
      substitution: `Mx = ${r(wu)} × ${lx}² / 8`,
      result: `Mx = ${r(MxPos)} kNm/m`,
      clause: "IS 456 Cl. 22",
    });
  } else {
    // Two-way slab using IS 456 Table 26 coefficients
    const coeffs = slabCoefficients[input.edgeCondition] || slabCoefficients.all_edges_simply_supported;

    MxNeg = coeffs.alphaX[0] * wu * Math.pow(lx, 2);
    MxPos = coeffs.alphaX[1] * wu * Math.pow(lx, 2);
    MyNeg = coeffs.alphaY[0] * wu * Math.pow(lx, 2);
    MyPos = coeffs.alphaY[1] * wu * Math.pow(lx, 2);

    steps.push({
      label: "Bending Moments (Two-way, IS 456 Table 26)",
      formula: "M = α × wu × lx²",
      substitution: `αx+ = ${coeffs.alphaX[1]}, αx- = ${coeffs.alphaX[0]}, αy+ = ${coeffs.alphaY[1]}, αy- = ${coeffs.alphaY[0]}`,
      result: `Mx+ = ${r(MxPos)}, Mx- = ${r(MxNeg)}, My+ = ${r(MyPos)}, My- = ${r(MyNeg)} kNm/m`,
      clause: "IS 456 Cl. 24.4, Table 26",
    });
  }

  // Reinforcement for short span (using max positive moment)
  const MuMax = Math.max(MxPos, MxNeg) * 1e6; // Nmm per m width
  const AstX = (0.5 * concrete.fck * 1000 * d / steel.fy) *
    (1 - Math.sqrt(1 - (4.6 * MuMax) / (concrete.fck * 1000 * d * d)));
  const AstMinSlab = (0.12 / 100) * 1000 * D_slab; // for HYSD bars
  const AstXProvide = Math.max(AstX, AstMinSlab);

  // Bar selection for short span
  const shortSpanBars = selectBars(AstXProvide, 3);
  const spacingX = Math.min(Math.floor(1000 * Math.PI * Math.pow(shortSpanBars.diameter, 2) / 4 / AstXProvide), 3 * d, 300);

  steps.push({
    label: "Short Span Reinforcement",
    formula: "Ast = (0.5×fck×b×d/fy) × [1 - √(1 - 4.6Mu/(fck×b×d²))]",
    substitution: `Mu = ${r(MuMax / 1e6)} kNm/m, b = 1000mm`,
    result: `Ast = ${r(AstXProvide)} mm²/m → ${shortSpanBars.diameter}mm @ ${spacingX}mm c/c`,
    clause: "IS 456 Cl. 26.5.2.1",
  });

  // Reinforcement for long span
  const dY = d - shortSpanBars.diameter; // reduced effective depth
  const MuY = Math.max(MyPos, MyNeg) * 1e6;
  let AstY: number;
  if (slabType === "two-way" && MuY > 0) {
    AstY = (0.5 * concrete.fck * 1000 * dY / steel.fy) *
      (1 - Math.sqrt(1 - (4.6 * MuY) / (concrete.fck * 1000 * dY * dY)));
  } else {
    AstY = AstMinSlab; // distribution steel for one-way
  }
  AstY = Math.max(AstY, AstMinSlab);

  const longSpanBars = selectBars(AstY, 3);
  const spacingY = Math.min(Math.floor(1000 * Math.PI * Math.pow(longSpanBars.diameter, 2) / 4 / AstY), 5 * d, 450);

  steps.push({
    label: slabType === "one-way" ? "Distribution Steel" : "Long Span Reinforcement",
    formula: slabType === "one-way" ? "Ast,dist = 0.12% × b × D (HYSD)" : "Same formula with reduced d",
    substitution: slabType === "one-way" ? `0.12% × 1000 × ${D_slab}` : `Mu = ${r(MuY / 1e6)} kNm/m, d' = ${dY}mm`,
    result: `Ast = ${r(AstY)} mm²/m → ${longSpanBars.diameter}mm @ ${spacingY}mm c/c`,
    clause: "IS 456 Cl. 26.5.2.1",
  });

  // Deflection check
  const spanDepthRatio = (lx * 1000) / d;
  const ptProvided = (AstXProvide * 100) / (1000 * d);
  const fsActual = 0.58 * steel.fy * AstXProvide / (shortSpanBars.areaProvided * Math.ceil(1000 / spacingX));
  const mfDefl = Math.min(2.0, Math.max(1.0, 1.6 - 0.002 * fsActual));
  const allowableRatioSlab = basicRatio * mfDefl;

  steps.push({
    label: "Deflection Check",
    formula: "L/d ≤ basic ratio × MF",
    substitution: `L/d = ${r(spanDepthRatio)}, allowable = ${basicRatio} × ${r(mfDefl)} = ${r(allowableRatioSlab)}`,
    result: spanDepthRatio <= allowableRatioSlab ? "SAFE" : "UNSAFE – Increase depth",
    clause: "IS 456 Cl. 23.2.1",
  });

  let status: "safe" | "warning" | "unsafe" = "safe";
  if (spanDepthRatio > allowableRatioSlab) status = "unsafe";
  else if (spanDepthRatio > allowableRatioSlab * 0.9) status = "warning";

  return {
    slabType,
    thickness: D_slab,
    effectiveDepth: d,
    reinforcement: {
      shortSpanBars: `${shortSpanBars.diameter}mm Ø @ ${spacingX}mm c/c`,
      longSpanBars: `${longSpanBars.diameter}mm Ø @ ${spacingY}mm c/c`,
      shortSpanArea: r(AstXProvide),
      longSpanArea: r(AstY),
      distributionBars: slabType === "one-way" ? `${longSpanBars.diameter}mm Ø @ ${spacingY}mm c/c` : "N/A",
    },
    moments: {
      shortSpanPositive: r(MxPos, 2),
      shortSpanNegative: r(MxNeg, 2),
      longSpanPositive: r(MyPos, 2),
      longSpanNegative: r(MyNeg, 2),
    },
    deflection: {
      spanDepthRatio: r(spanDepthRatio, 1),
      allowableRatio: r(allowableRatioSlab, 1),
    },
    steps,
    status,
  };
}

// ============ COMPLIANCE ============

export function checkCompliance(input: ComplianceInput): ComplianceResult {
  const seismicZoneFactors = { II: 0.10, III: 0.16, IV: 0.24, V: 0.36 };
  const zoneFactor = seismicZoneFactors[input.seismicZone];
  const responseFactor = 5.0;
  const buildingWeight = input.builtUpArea * 12;
  const baseShear = (zoneFactor / (2 * responseFactor)) * buildingWeight * 2.5;

  const windSpeeds = { "1": 33, "2": 39, "3": 44, "4": 47, "5": 50, "6": 55 };
  const basicSpeed = windSpeeds[input.windZone];
  const designPressure = 0.6 * Math.pow(basicSpeed, 2) / 1000;

  const farLimits = { residential: 2.0, commercial: 2.5, industrial: 1.5, institutional: 2.0 };
  const requiredFar = farLimits[input.buildingType];
  const providedFar = input.builtUpArea / input.plotArea;

  const gcLimits = { residential: 0.6, commercial: 0.7, industrial: 0.5, institutional: 0.55 };
  const requiredGc = gcLimits[input.buildingType];
  const providedGc = (input.builtUpArea / input.stories) / input.plotArea;

  const setbackRequirements = {
    front: Math.max(3, input.stories * 0.5),
    rear: Math.max(2, input.stories * 0.3),
    side: Math.max(1.5, input.stories * 0.2),
  };

  const bylawsResult = {
    far: { required: requiredFar, provided: r(providedFar), compliant: providedFar <= requiredFar },
    groundCoverage: { required: requiredGc, provided: r(providedGc), compliant: providedGc <= requiredGc },
    setbacks: {
      front: { required: setbackRequirements.front, provided: input.setbackFront, compliant: input.setbackFront >= setbackRequirements.front },
      rear: { required: setbackRequirements.rear, provided: input.setbackRear, compliant: input.setbackRear >= setbackRequirements.rear },
      side: { required: setbackRequirements.side, provided: input.setbackSide, compliant: input.setbackSide >= setbackRequirements.side },
    },
  };

  const allCompliant = bylawsResult.far.compliant && bylawsResult.groundCoverage.compliant &&
    bylawsResult.setbacks.front.compliant && bylawsResult.setbacks.rear.compliant && bylawsResult.setbacks.side.compliant;
  const noneCompliant = !bylawsResult.far.compliant && !bylawsResult.groundCoverage.compliant;

  return {
    seismic: { zoneFactor, responseFactor, baseShear: Math.round(baseShear), compliant: true },
    wind: { basicSpeed, designPressure: r(designPressure), compliant: true },
    bylaws: bylawsResult,
    overallStatus: allCompliant ? "compliant" : noneCompliant ? "non-compliant" : "partial",
  };
}

// ============ COST ESTIMATION ============

export interface MaterialRates {
  concrete: { [key: string]: number };
  steel: number;
  formwork: number;
  excavation: number;
  labor: number;
}

export const defaultMaterialRates: MaterialRates = {
  concrete: { M20: 5500, M25: 6000, M30: 6500, M35: 7000, M40: 7500 },
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
  const totalSteelArea = result.reinforcement.tensionArea + result.reinforcement.compressionArea;
  const steelLength = input.spanLength * 1.1;
  const steelWeight = totalSteelArea * steelLength * 0.00785;
  const stirrupWeight = steelWeight * 0.25;
  const totalSteelWeight = steelWeight + stirrupWeight;
  const steelCost = totalSteelWeight * rates.steel;
  const formworkArea = 2 * (input.depth / 1000) * input.spanLength + (input.width / 1000) * input.spanLength;
  const formworkCost = formworkArea * rates.formwork;
  const materialTotal = concreteCost + steelCost + formworkCost;
  const laborCost = materialTotal * (rates.labor / 100);
  return {
    materials: {
      concrete: { quantity: r(volume), unit: "m³", rate: rates.concrete[input.concreteGrade], cost: Math.round(concreteCost) },
      steel: { quantity: Math.round(totalSteelWeight), unit: "kg", rate: rates.steel, cost: Math.round(steelCost) },
      formwork: { quantity: r(formworkArea), unit: "m²", rate: rates.formwork, cost: Math.round(formworkCost) },
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
      concrete: { quantity: r(volume), unit: "m³", rate: rates.concrete[input.concreteGrade], cost: Math.round(concreteCost) },
      steel: { quantity: Math.round(totalSteelWeight), unit: "kg", rate: rates.steel, cost: Math.round(steelCost) },
      formwork: { quantity: r(formworkArea), unit: "m²", rate: rates.formwork, cost: Math.round(formworkCost) },
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
      concrete: { quantity: r(volume), unit: "m³", rate: rates.concrete[input.concreteGrade], cost: Math.round(concreteCost) },
      steel: { quantity: Math.round(steelWeight), unit: "kg", rate: rates.steel, cost: Math.round(steelCost) },
      formwork: { quantity: r(formworkArea), unit: "m²", rate: rates.formwork, cost: Math.round(formworkCost + excavationCost) },
    },
    labor: Math.round(laborCost),
    total: Math.round(materialTotal + laborCost),
  };
}

export function estimateSlabCost(input: SlabInput, result: SlabDesignResult, rates: MaterialRates = defaultMaterialRates): CostEstimate {
  const lx = Math.min(input.spanLx, input.spanLy);
  const ly = Math.max(input.spanLx, input.spanLy);
  const volume = lx * ly * (result.thickness / 1000);
  const concreteCost = volume * rates.concrete[input.concreteGrade];
  const totalSteelArea = result.reinforcement.shortSpanArea + result.reinforcement.longSpanArea;
  const avgSpan = (lx + ly) / 2;
  const steelWeight = totalSteelArea * avgSpan * 1.15 * 0.00785;
  const steelCost = steelWeight * rates.steel;
  const formworkArea = lx * ly;
  const formworkCost = formworkArea * rates.formwork;
  const materialTotal = concreteCost + steelCost + formworkCost;
  const laborCost = materialTotal * (rates.labor / 100);
  return {
    materials: {
      concrete: { quantity: r(volume), unit: "m³", rate: rates.concrete[input.concreteGrade], cost: Math.round(concreteCost) },
      steel: { quantity: Math.round(steelWeight), unit: "kg", rate: rates.steel, cost: Math.round(steelCost) },
      formwork: { quantity: r(formworkArea), unit: "m²", rate: rates.formwork, cost: Math.round(formworkCost) },
    },
    labor: Math.round(laborCost),
    total: Math.round(materialTotal + laborCost),
  };
}

// ============ EDGE CONDITION LABELS ============

export const edgeConditionLabels: Record<string, string> = {
  all_edges_simply_supported: "All edges simply supported",
  one_long_edge_fixed: "One long edge fixed",
  one_short_edge_fixed: "One short edge fixed",
  two_adjacent_edges_fixed: "Two adjacent edges fixed",
  two_short_edges_fixed: "Two short edges fixed",
  two_long_edges_fixed: "Two long edges fixed",
  three_edges_fixed: "Three edges fixed",
  all_edges_fixed: "All edges fixed",
};
